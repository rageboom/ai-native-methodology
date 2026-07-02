"""Grafana(LGTM) tools — Mimir PromQL, Loki, Tempo, alert rules, AlertManager silence.

diagnose-alert.py(platform-automation/grafana) 로직 이식. read 도구 + silence(쓰기, confirm 게이트).
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from . import config, http

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------

_SINCE_RE = re.compile(r"(\d+)([mhd])")


def parse_since(since: str) -> timedelta:
    m = _SINCE_RE.fullmatch(since.strip())
    if not m:
        raise ValueError(f"잘못된 기간 형식: {since!r} (예: 30m, 1h, 6h, 24h, 7d)")
    n, unit = int(m.group(1)), m.group(2)
    return {"m": timedelta(minutes=n), "h": timedelta(hours=n), "d": timedelta(days=n)}[unit]


def safe_label_value(v: str) -> str:
    if '"' in v or "\\" in v:
        raise ValueError(f'라벨/패턴에 " 또는 백슬래시를 포함할 수 없습니다: {v!r}')
    return v


def appsel(app: str | None) -> dict[str, str]:
    if app:
        safe_label_value(app)
        return {"SEL": f'{{app="{app}"}}', "SELA": f',app="{app}"'}
    return {"SEL": "", "SELA": ""}


def apply_sel(tmpl: str, sel: dict[str, str]) -> str:
    return tmpl.replace("__SEL__", sel["SEL"]).replace("__SELA__", sel["SELA"])


def categorize(name: str, expr: str) -> str:
    blob = (name + " " + expr).lower()
    if "kafka" in blob:
        return "kafka"
    if "redis" in blob:
        return "redis"
    if any(k in blob for k in ("jvm", "gc", "heap", "thread")):
        return "jvm"
    if any(k in blob for k in ("hikari", "db_client", "dbquery")):
        return "db"
    if any(k in blob for k in ("http", "errorrate", "responsetime", "slo", "tomcat", "traffic")):
        return "http"
    if any(k in blob for k in ("batch", "pod", "replicas")):
        return "k8s"
    return "generic"


CAUSAL: dict[str, list[tuple[str, str]]] = {
    "jvm": [
        ("JVM heap 사용률", 'sum by (app) (jvm_memory_used_bytes{area="heap"__SELA__}) / sum by (app) (jvm_memory_max_bytes{area="heap"__SELA__} > 0)'),
        ("GC pause 평균(s)", "rate(jvm_gc_pause_seconds_sum__SEL__[5m]) / rate(jvm_gc_pause_seconds_count__SEL__[5m])"),
        ("live threads", "jvm_threads_live__SEL__"),
        ("blocked threads", 'jvm_threads_states{state="blocked"__SELA__}'),
    ],
    "db": [
        ("Hikari 활성/최대", "hikaricp_connections_active__SEL__ / hikaricp_connections_max__SEL__"),
        ("Hikari pending", "hikaricp_connections_pending__SEL__"),
        ("JVM heap 사용률", 'sum by (app) (jvm_memory_used_bytes{area="heap"__SELA__}) / sum by (app) (jvm_memory_max_bytes{area="heap"__SELA__} > 0)'),
    ],
    "http": [
        ("5xx 비율", 'sum by (app) (rate(http_server_requests_seconds_count{status=~"5.."__SELA__}[5m])) / sum by (app) (rate(http_server_requests_seconds_count__SEL__[5m]))'),
        ("요청률(rps)", "sum by (app) (rate(http_server_requests_seconds_count__SEL__[5m]))"),
        ("p95 지연(s)", "histogram_quantile(0.95, sum by (le, app) (rate(http_server_requests_seconds_bucket__SEL__[5m])))"),
        ("Tomcat busy/max", "tomcat_threads_busy__SEL__ / tomcat_threads_config_max__SEL__"),
        ("Hikari 활성/최대", "hikaricp_connections_active__SEL__ / hikaricp_connections_max__SEL__"),
    ],
    "kafka": [
        ("broker up 수", 'count(up{job="kafka-broker"} == 1)'),
        ("under-replicated", 'sum(kafka_server_replicamanager_underreplicatedpartitions{job="kafka-broker"})'),
        ("max consumer lag", 'max(kafka_server_fetcherlagmetrics_consumerlag{job="kafka-broker"})'),
    ],
    "redis": [("redis up", 'up{job="redis-cluster"}')],
    "k8s": [("pod phase", "kube_pod_status_phase__SEL__")],
}


def fmt_series(result: dict[str, Any], points: int = 10) -> str:
    data = result.get("data", {}).get("result", [])
    if not data:
        return "  (데이터 없음)"
    lines = []
    for s in data[:6]:
        metric = s.get("metric", {})
        parts = [metric.get("app"), metric.get("service_instance_id") or metric.get("instance") or metric.get("pod")]
        label = " / ".join(p for p in parts if p) or "(no labels)"
        vals = s.get("values", [])
        if not vals:
            continue
        step = max(1, len(vals) // points)
        sampled = vals[::step][-points:]
        nums = []
        for _, v in sampled:
            try:
                nums.append(f"{float(v):.3g}")
            except ValueError:
                nums.append(v)
        last = nums[-1] if nums else "?"
        lines.append(f"  [{label}] 현재={last}  추이: {' → '.join(nums)}")
    return "\n".join(lines) if lines else "  (데이터 없음)"


# ---- HTTP helper -------------------------------------------------------------

def _ds(gurl: str, uid: str, path: str) -> str:
    return f"{gurl}/api/datasources/proxy/uid/{uid}{path}"


def _hdr(key: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {key}"}


def _window(since: str) -> tuple[int, int, int]:
    end = datetime.now(timezone.utc)
    start = end - parse_since(since)
    s, e = int(start.timestamp()), int(end.timestamp())
    step = max(15, (e - s) // 60)
    return s, e, step


def _find_rule(gurl: str, key: str, alert: str) -> dict[str, Any] | None:
    d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/rules"), headers=_hdr(key))
    if d.get("status") != "success":
        return None
    for g in d.get("data", {}).get("groups", []):
        for r in g.get("rules", []):
            if r.get("type") == "alerting" and r.get("name") == alert:
                return {"query": r.get("query", ""), "for": r.get("duration", 0), "labels": r.get("labels", {})}
    return None


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def grafana_promql_query(query: str, env: str = "prod", at: str | None = None) -> dict[str, Any]:
        """Mimir 에 PromQL instant 쿼리. env='prod'|'stg'|'dev'. at=ISO8601(기본 현재).

        주의: PROD 메트릭은 OTel micrometer 네이밍 — jvm_threads_live(O) != ..._threads(X).
        메트릭명 불확실하면 grafana_list_metrics 로 먼저 실측할 것.
        """
        gurl, key = config.grafana(env)
        params: dict[str, Any] = {"query": query}
        if at:
            params["time"] = at
        d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/query"), headers=_hdr(key), params=params)
        out = [{"labels": r.get("metric", {}), "value": r.get("value", [None, None])[1]} for r in d.get("data", {}).get("result", [])]
        return {"query": query, "count": len(out), "result": out[:50]}

    @mcp.tool()
    def grafana_promql_range(query: str, since: str = "1h", env: str = "prod", step: int | None = None) -> str:
        """Mimir PromQL range 쿼리 — 시계열 추이를 텍스트로. since: 30m/1h/6h/24h/7d."""
        gurl, key = config.grafana(env)
        s, e, auto_step = _window(since)
        params = {"query": query, "start": s, "end": e, "step": step or auto_step}
        d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/query_range"), headers=_hdr(key), params=params)
        return f"query: {query}\nrange: {since} (step {step or auto_step}s)\n{fmt_series(d)}"

    @mcp.tool()
    def grafana_list_metrics(pattern: str = ".+", env: str = "prod", limit: int = 200) -> list[str]:
        """메트릭명 탐색 — __name__ 정규식 매칭. 정확한 메트릭명 확인용(네이밍 함정 해소)."""
        gurl, key = config.grafana(env)
        safe_label_value(pattern)
        d = http.get_json(
            _ds(gurl, config.MIMIR_UID, "/api/v1/query"),
            headers=_hdr(key),
            params={"query": f'count by(__name__)({{__name__=~"{pattern}"}})'},
        )
        names = sorted({r["metric"].get("__name__", "") for r in d.get("data", {}).get("result", [])})
        return [n for n in names if n][:limit]

    @mcp.tool()
    def grafana_loki_query(logql: str, since: str = "1h", env: str = "prod", limit: int = 50) -> list[str]:
        """Loki LogQL 로그 조회. 예: '{service_name=~"ep-be-tlm.*"} | logfmt | level=~"ERROR|WARN"'."""
        gurl, key = config.grafana(env)
        s, e, _ = _window(since)
        d = http.get_json(
            _ds(gurl, config.LOKI_UID, "/loki/api/v1/query_range"),
            headers=_hdr(key),
            params={"query": logql, "start": s * 10**9, "end": e * 10**9, "limit": limit, "direction": "backward"},
        )
        lines = []
        for st in d.get("data", {}).get("result", []):
            for _, line in st.get("values", []):
                lines.append(line[:300])
        return lines[:limit]

    @mcp.tool()
    def grafana_tempo_search(traceql: str = "{}", since: str = "1h", env: str = "prod", limit: int = 20) -> dict[str, Any]:
        """Tempo trace 검색 (TraceQL). 예: '{ duration > 1s }', '{ resource.service.name = \"ep-be-gea-api\" }'."""
        gurl, key = config.grafana(env)
        s, e, _ = _window(since)
        d = http.get_json(
            _ds(gurl, config.TEMPO_UID, "/api/search"),
            headers=_hdr(key),
            params={"q": traceql, "start": s, "end": e, "limit": limit},
        )
        traces = [
            {"traceID": t.get("traceID"), "rootServiceName": t.get("rootServiceName"),
             "rootTraceName": t.get("rootTraceName"), "durationMs": t.get("durationMs")}
            for t in d.get("traces", [])
        ]
        return {"traceql": traceql, "count": len(traces), "traces": traces}

    @mcp.tool()
    def grafana_list_alert_rules(name_filter: str | None = None, env: str = "prod") -> list[dict[str, Any]]:
        """Mimir ruler 의 alerting rule 목록 (이름/expr/for/labels). name_filter 부분일치."""
        gurl, key = config.grafana(env)
        d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/rules"), headers=_hdr(key))
        out = []
        for g in d.get("data", {}).get("groups", []):
            for r in g.get("rules", []):
                if r.get("type") != "alerting":
                    continue
                if name_filter and name_filter.lower() not in r.get("name", "").lower():
                    continue
                out.append({"name": r.get("name"), "query": r.get("query"), "for": r.get("duration"), "labels": r.get("labels", {})})
        return out

    @mcp.tool()
    def grafana_diagnose_alert(alert: str, since: str = "1h", service: str | None = None, env: str = "prod") -> str:
        """알림 1건 종합 진단 — rule expr + 4계층 인과(JVM/DB/HTTP/Kafka/Redis/K8s) + 동시 firing + 로그."""
        gurl, key = config.grafana(env)
        s, e, step = _window(since)
        lines = [f"# 알림 진단: {alert}  (env={env}, since={since})"]
        rule = _find_rule(gurl, key, alert)
        if rule:
            expr = rule["query"]
            cat = categorize(alert, expr)
            lines += ["", "## 1. 알림 조건", f"  {expr}", f"  for: {rule['for']}s  labels: {rule['labels']}"]
            d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/query_range"), headers=_hdr(key),
                              params={"query": expr, "start": s, "end": e, "step": step})
            lines += ["", "## 2. 조건식 추이", fmt_series(d)]
        else:
            lines.append(f"\n⚠️ '{alert}' rule 미발견 — 인과 분석만 수행")
            cat = categorize(alert, "")

        sel = appsel(service)
        if CAUSAL.get(cat):
            lines += ["", f"## 3. 인과 분석 (카테고리: {cat})"]
            for title, tmpl in CAUSAL[cat]:
                q = apply_sel(tmpl, sel)
                try:
                    d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/query_range"), headers=_hdr(key),
                                      params={"query": q, "start": s, "end": e, "step": step})
                    lines += [f"### {title}", fmt_series(d)]
                except Exception as ex:
                    lines.append(f"### {title}  (조회실패: {ex})")

        lines += ["", "## 4. 동시 firing 알림"]
        try:
            d = http.get_json(_ds(gurl, config.MIMIR_UID, "/api/v1/query"), headers=_hdr(key),
                              params={"query": 'ALERTS{alertstate="firing"}', "time": e})
            seen: dict[str, set[str]] = {}
            for r in d.get("data", {}).get("result", []):
                m = r["metric"]
                seen.setdefault(m.get("alertname", "?"), set()).add(m.get("app") or m.get("instance") or "")
            for n in sorted(seen):
                tgt = ", ".join(sorted(t for t in seen[n] if t))
                lines.append(f"  - {n}" + (f" ({tgt})" if tgt else ""))
        except Exception as ex:
            lines.append(f"  (조회실패: {ex})")

        if service:
            lines += ["", "## 5. 최근 로그 (Loki, ERROR/WARN)"]
            try:
                ld = http.get_json(_ds(gurl, config.LOKI_UID, "/loki/api/v1/query_range"), headers=_hdr(key),
                                   params={"query": f'{{service_name=~"{service}.*"}} | logfmt | level=~"ERROR|WARN"',
                                           "start": s * 10**9, "end": e * 10**9, "limit": 15, "direction": "backward"})
                logs = [line[:200] for st in ld.get("data", {}).get("result", []) for _, line in st.get("values", [])]
                lines += [f"  {x}" for x in logs[:10]] or ["  (로그 없음)"]
            except Exception as ex:
                lines.append(f"  (조회실패: {ex})")
        return "\n".join(lines)

    @mcp.tool()
    def grafana_create_silence(
        alert: str,
        duration: str = "2h",
        instance: str | None = None,
        comment: str | None = None,
        created_by: str | None = None,
        confirm: bool = False,
        env: str = "prod",
    ) -> dict[str, Any]:
        """AlertManager silence 생성 (쓰기). confirm=False 면 dry-run(payload 미리보기)만 반환."""
        gurl, key = config.grafana(env)
        now = datetime.now(timezone.utc)
        ends = now + parse_since(duration)
        matchers = [{"name": "alertname", "value": alert, "isRegex": False, "isEqual": True}]
        if instance:
            matchers.append({"name": "instance", "value": instance, "isRegex": False, "isEqual": True})
        import os
        payload = {
            "matchers": matchers,
            "startsAt": now.isoformat(),
            "endsAt": ends.isoformat(),
            "createdBy": created_by or os.environ.get("JIRA_USER", "illuminati-mcp"),
            "comment": comment or f"silenced via illuminati-mcp ({duration})",
        }
        if not confirm:
            return {"dry_run": True, "payload": payload, "note": "confirm=true 로 다시 호출해야 실제 생성됨"}
        ds = http.get_json(f"{gurl}/api/datasources", headers=_hdr(key))
        am_uid = next((d["uid"] for d in ds if d.get("type") == "alertmanager"), None)
        if not am_uid:
            return {"error": "AlertManager datasource 미발견"}
        res = http.post_json(_ds(gurl, am_uid, "/api/v2/silences"), headers={**_hdr(key), "Content-Type": "application/json"}, json_body=payload)
        return {"created": True, "silenceID": res.get("silenceID"), "endsAt": payload["endsAt"]}
