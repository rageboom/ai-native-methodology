"""Frontend 정적 audit — BO(mis-fe-admin) MF remote 정합 + FO(front) Faro/배포/nginx 점검 (read-only)."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from . import config

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------

_BO_REMOTES = ["119", "tlm", "gea", "hrm", "eam", "observer"]
_FO_APPS = ["tlm", "gea", "hrm"]
_FO_ENVS = ["dev", "stg", "prod"]


def parse_vite_remotes(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for name, env_var in re.findall(r"'(remote-[\w-]+)'\s*:\s*\{[^}]*?entry:\s*env\.(\w+)", text, re.DOTALL):
        out[name] = env_var
    return out


def parse_vite_expose(text: str) -> dict[str, str | None]:
    name = re.search(r"name:\s*'(remote-[\w-]+)'", text)
    public_path = re.search(r"getPublicPath:\s*`return\s*'([^']+)'`", text)
    return {
        "name": name.group(1) if name else None,
        "public_path": public_path.group(1) if public_path else None,
    }


def parse_env_remote_urls(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"REACT_APP_REMOTE_(\w+)_URL\s*=\s*(\S+)", line)
        if m:
            out[m.group(1).lower()] = m.group(2)
    return out


def parse_proxy_routes(text: str) -> list[str]:
    return re.findall(r"location\s+(\S+)\s*\{", text)


def parse_groovy_suffix(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for key, val in re.findall(r"'([\w-]+)'\s*:\s*'([\w-]+)'", text):
        out[key] = val
    return out


def cross_check(sources: dict[str, dict[str, Any]]) -> list[str]:
    flags: list[str] = []
    for name, row in sources.items():
        expected_loc = f"/remote-{name}/"
        if row.get("nginx_location") is None:
            flags.append(f"{name}: nginx location 누락 (예상 {expected_loc})")
        if row.get("env_url") is None:
            flags.append(f"{name}: env REACT_APP_REMOTE URL 누락")
        if row.get("vite_expose") is None:
            flags.append(f"{name}: vite expose 선언 누락")
        if row.get("compose_service") is None:
            flags.append(f"{name}: compose service 누락")
        if row.get("groovy_suffix") is None:
            flags.append(f"{name}: buildScript.groovy suffix 누락")
    return flags


def parse_env_faro(text: str) -> str | None:
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"REACT_APP_FARO_URL\s*=\s*(\S+)", line)
        if m:
            return m.group(1)
    return None


def parse_nginx_collect(text: str) -> str | None:
    m = re.search(r"location\s*=?\s*/collect\s*\{[^}]*?proxy_pass\s+(\S+?);", text, re.DOTALL)
    return m.group(1) if m else None


def audit_faro(env_map: dict[tuple[str, str], str | None], nginx_map: dict[tuple[str, str], str | None]) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []
    for key in sorted(set(env_map) | set(nginx_map)):
        app, env = key
        faro = env_map.get(key)
        proxy = nginx_map.get(key)
        if faro is None and proxy is None:
            if env == "stg":
                flags.append({"app": app, "env": env, "severity": "info",
                              "note": "stg Faro 미설정 — 의도된 것일 수 있음 (단정 불가)"})
            else:
                flags.append({"app": app, "env": env, "severity": "warn",
                              "note": "env/nginx 둘 다 Faro 미설정"})
        elif faro is not None and proxy is None:
            flags.append({"app": app, "env": env, "severity": "warn",
                          "note": "env REACT_APP_FARO_URL 있으나 nginx /collect proxy_pass 없음"})
        elif faro is None and proxy is not None:
            flags.append({"app": app, "env": env, "severity": "warn",
                          "note": "nginx /collect 있으나 env REACT_APP_FARO_URL 없음"})
    return flags


def parse_turbo_targets(json_text: str) -> list[tuple[str, str]]:
    data = json.loads(json_text)
    keys = list((data.get("pipeline") or data.get("tasks") or {}).keys())
    out: list[tuple[str, str]] = []
    for k in keys:
        m = re.match(r"ep-fe-(\w+)#build:(\w+)", k)
        if m:
            out.append((m.group(1), m.group(2)))
            continue
        m = re.match(r"build:(\w+)$", k)
        if m:
            out.append(("*", m.group(1)))
    return out


def flag_deploy_matrix(matrix: dict[tuple[str, str], dict[str, Any]]) -> list[str]:
    flags: list[str] = []
    for (app, env), row in sorted(matrix.items()):
        if not row.get("deploy_dir_exists"):
            flags.append(f"{app}/{env}: deploy 디렉토리 부재")
        if not row.get("env_file_exists"):
            flags.append(f"{app}/{env}: .env.{env} 파일 부재")
        if row.get("turbo_target") is None:
            flags.append(f"{app}/{env}: turbo build:{env} 타겟 부재")
        if row.get("nginx_conf_path") is None and row.get("deploy_dir_exists"):
            flags.append(f"{app}/{env}: nginx conf 부재")
    return flags


def parse_nginx_conf(text: str) -> dict[str, Any]:
    wp = re.search(r"^\s*worker_processes\s+(\S+?);", text, re.MULTILINE)
    gcl = re.search(r"^\s*gzip_comp_level\s+(\S+?);", text, re.MULTILINE)
    immutable = bool(re.search(r'Cache-Control\s+"[^"]*immutable', text))
    nostore = bool(re.search(r"(remoteEntry|mf-manifest)[^}]*?no-store", text, re.DOTALL))
    return {
        "worker_processes": wp.group(1) if wp else None,
        "gzip_static": bool(re.search(r"^\s*gzip_static\s+on;", text, re.MULTILINE)),
        "gzip_comp_level": gcl.group(1) if gcl else None,
        "immutable_cache": immutable,
        "remoteEntry_nostore": nostore,
        "health": bool(re.search(r"location\s*=?\s*/health\b", text)),
    }


def audit_nginx(parsed: dict[str, Any]) -> list[str]:
    flags: list[str] = []
    if parsed.get("worker_processes") == "auto":
        flags.append("worker_processes auto: cgroup CPU limit 무시하고 노드 전체 코어 fork (RSS 압박). 정적 SPA 는 1 권장")
    if not parsed.get("gzip_static"):
        flags.append("gzip_static off: pre-compressed .gz 미서빙 → 런타임 압축 CPU 비용")
    cl = parsed.get("gzip_comp_level")
    if cl is not None and cl.isdigit() and int(cl) >= 5 and parsed.get("gzip_static"):
        flags.append(f"gzip_comp_level {cl}: gzip_static 환경에서 높은 fallback level 은 CPU 스파이크")
    if not parsed.get("immutable_cache"):
        flags.append("immutable cache 헤더 없음: 해시 자산 재요청 발생")
    return flags


# ---- 파일 로딩 helper (사내망 불필요, 로컬 레포 읽기) -------------------------

def _read(path: Path) -> str:
    try:
        return path.read_text()
    except OSError:
        return ""


def _bo_root(repo_path: str | None) -> Path:
    return Path(repo_path) if repo_path else config.repo("mis-fe-admin")


def _fo_root(repo_path: str | None) -> Path:
    return Path(repo_path) if repo_path else config.repo("front")


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def frontend_mf_remote_consistency(repo_path: str | None = None, env: str | None = None) -> dict[str, Any]:
        """BO(mis-fe-admin) Module Federation remote 6개를 vite/env/nginx/compose/groovy 교차검증 (read-only).

        화이트스크린 #1 원인(remote 404) 진단용. repo_path=BO 레포 경로(없으면 config.repo('mis-fe-admin')).
        env='dev'|'stg'|'prod' (env URL 매핑할 .env 선택, 기본 dev). 반환: remote별 행 + mismatch 리스트.
        """
        root = _bo_root(repo_path)
        env = env or "dev"
        host = parse_vite_remotes(_read(root / "apps/common/vite.config.ts"))
        env_urls = parse_env_remote_urls(_read(root / f"deploy/.env.{env}"))
        nginx_locs = parse_proxy_routes(_read(root / "deploy/proxy.routes.inc"))
        groovy = parse_groovy_suffix(_read(root / "buildScript.groovy"))
        compose = _read(root / "deploy/docker-compose.yml")

        sources: dict[str, dict[str, Any]] = {}
        rows: list[dict[str, Any]] = []
        for name in _BO_REMOTES:
            rname = f"remote-{name}"
            expose = parse_vite_expose(_read(root / f"apps/{name}/vite.config.ts"))
            row = {
                "remote_name": rname,
                "vite_expose": expose["name"],
                "env_url": env_urls.get(name),
                "nginx_location": f"/{rname}/" if f"/{rname}/" in nginx_locs else None,
                "compose_service": rname if re.search(rf"^\s+{rname}:", compose, re.MULTILINE) else None,
                "groovy_suffix": groovy.get(rname),
            }
            rows.append(row)
            sources[name] = row
        return {"repo": str(root), "env": env, "remotes": rows, "mismatch": cross_check(sources)}

    @mcp.tool()
    def frontend_faro_collect_audit(repo_path: str | None = None, expected_collector: dict | None = None) -> dict[str, Any]:
        """FO(front) Faro RUM 정합 audit — env REACT_APP_FARO_URL ↔ nginx /collect proxy_pass (read-only).

        repo_path=FO 레포 경로(없으면 config.repo('front')). expected_collector={env: 'host:port'} 선택.
        stg 누락은 'info'(의도 가능, 단정 안 함), env/nginx 불일치는 'warn'. 반환: env×app 매트릭스 + flags.
        """
        root = _fo_root(repo_path)
        env_map: dict[tuple[str, str], str | None] = {}
        nginx_map: dict[tuple[str, str], str | None] = {}
        matrix: list[dict[str, Any]] = []
        for app in _FO_APPS:
            for env in _FO_ENVS:
                env_file = "prod" if env == "prod" else env
                faro = parse_env_faro(_read(root / f"apps/ep-fe-{app}/.env.{env_file}"))
                proxy = parse_nginx_collect(_read(root / f"deploy/{env}/{app}/ep-fe-{app}.conf"))
                env_map[(app, env)] = faro
                nginx_map[(app, env)] = proxy
                matrix.append({"app": app, "env": env, "faro_url_env": faro,
                               "nginx_proxy_pass": proxy, "match": (faro is not None) == (proxy is not None)})
        return {"repo": str(root), "matrix": matrix, "flags": audit_faro(env_map, nginx_map)}

    @mcp.tool()
    def frontend_deploy_env_matrix(repo_path: str | None = None, app: str | None = None, env: str | None = None) -> dict[str, Any]:
        """FO(front) 배포 정합 매트릭스 — deploy 트리/turbo 타겟/Dockerfile ENV/env-file 교차 (read-only).

        repo_path=FO 레포 경로(없으면 config.repo('front')). app/env 필터 선택. 반환: app×env 행 + 빠진 칸 flags.
        """
        root = _fo_root(repo_path)
        turbo = dict.fromkeys(parse_turbo_targets(_read(root / "turbo.json")), True)
        apps = [app] if app else _FO_APPS
        envs = [env] if env else _FO_ENVS
        matrix: dict[tuple[str, str], dict[str, Any]] = {}
        rows: list[dict[str, Any]] = []
        for a in apps:
            for e in envs:
                deploy_dir = root / f"deploy/{e}/{a}"
                dockerfile = _read(deploy_dir / "Dockerfile")
                env_arg = re.search(r"build:\$ENVIRONMENT", dockerfile)
                conf = deploy_dir / f"ep-fe-{a}.conf"
                env_file = "prod" if e == "prod" else e
                has_target = (a, e) in turbo or ("*", e) in turbo
                row = {
                    "deploy_dir_exists": deploy_dir.is_dir(),
                    "dockerfile_env_arg": "build:$ENVIRONMENT" if env_arg else None,
                    "turbo_target": f"ep-fe-{a}#build:{e}" if has_target else None,
                    "env_file_exists": (root / f"apps/ep-fe-{a}/.env.{env_file}").exists(),
                    "nginx_conf_path": str(conf.relative_to(root)) if conf.exists() else None,
                }
                matrix[(a, e)] = row
                rows.append({"app": a, "env": e, **row})
        return {"repo": str(root), "matrix": rows, "flags": flag_deploy_matrix(matrix)}

    @mcp.tool()
    def frontend_nginx_perf_audit(repo_path: str | None = None, env: str | None = None) -> dict[str, Any]:
        """FO(front)+BO(mis-fe-admin) SPA nginx 성능/안전 audit (read-only).

        repo_path 미지정 시 두 레포 모두 점검. env='dev'|'stg'|'prod' (FO conf 트리 선택, 기본 dev).
        점검: worker_processes(auto cgroup fork), gzip_static/comp_level, immutable cache, remoteEntry no-store, /health.
        반환: conf별 파싱값 + flags.
        """
        env = env or "dev"
        targets: list[tuple[str, Path]] = []
        if repo_path:
            for p in Path(repo_path).rglob("*.conf"):
                targets.append((str(p), p))
            for p in Path(repo_path).rglob("nginx.conf"):
                targets.append((str(p), p))
        else:
            fo = _fo_root(None)
            for app in _FO_APPS:
                http = fo / f"deploy/{env}/{app}/nginx.conf"
                server = fo / f"deploy/{env}/{app}/ep-fe-{app}.conf"
                targets.append((f"FO {app}/{env}", _MergedPath(http, server)))
            bo = _bo_root(None)
            bo_http = bo / "deploy/nginx.conf"
            targets.append(("BO host(common)", _MergedPath(bo_http, bo / "deploy/host.conf")))
            targets.append(("BO remote", _MergedPath(bo_http, bo / "deploy/remote.conf")))

        results: list[dict[str, Any]] = []
        for label, path in targets:
            text = path.read_merged() if isinstance(path, _MergedPath) else _read(path)
            parsed = parse_nginx_conf(text)
            results.append({"conf": label, **parsed, "flags": audit_nginx(parsed)})
        return {"env": env, "confs": results}


class _MergedPath:
    """FO http(nginx.conf)+server(ep-fe-*.conf) 한 쌍을 합쳐서 점검."""

    def __init__(self, *paths: Path) -> None:
        self._paths = paths

    def read_merged(self) -> str:
        return "\n".join(_read(p) for p in self._paths)
