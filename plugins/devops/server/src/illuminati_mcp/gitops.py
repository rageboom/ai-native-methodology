"""GitOps tools — MIS-GitOps/scripts/ 셸 스크립트 subprocess 래퍼 (set-image-tag/policy-sweep/kubeconform/cross-chart/values-sync) + helm 렌더 위험 분류."""
from __future__ import annotations

import re
import subprocess
from typing import Any

from . import config

_ENVS = {"dev", "stg", "live"}
_MUTABLE_TAGS = {"", "latest", "stable", "main", "master", "kubernetes-v1.0.0prev"}
_TIMEOUT = 120

# ---- 순수 로직 (테스트 대상, 사내 CLI/클러스터 불필요) ------------------------


def validate_set_image_args(env: str, repository: str, tag: str) -> None:
    """set-image-tag.sh 와 동일한 인자 검증 (env 화이트리스트 + mutable tag 거부)."""
    if env not in _ENVS:
        raise ValueError(f"env 는 dev|stg|live 만 허용: {env!r}")
    if not repository.strip():
        raise ValueError("repository 가 비어 있습니다")
    if tag in _MUTABLE_TAGS:
        raise ValueError(f"mutable/금지 tag 거부: {tag!r}. git SHA 기반 immutable tag 만 허용")


_FILE_LINE_RE = re.compile(r"^\s*(\S+)\s*:\s*(\d+)\s*tag 갱신")
_TOTAL_RE = re.compile(r"총\s+(\d+)\s+tag")


def parse_set_image_output(stdout: str) -> dict[str, Any]:
    """set-image-tag.sh 출력에서 변경 파일과 갱신 건수 추출."""
    files: list[str] = []
    count = 0
    for line in stdout.splitlines():
        m = _FILE_LINE_RE.match(line)
        if m:
            files.append(m.group(1))
    t = _TOTAL_RE.search(stdout)
    if t:
        count = int(t.group(1))
    return {"changed_files": files, "count": count}


def parse_policy_output(stdout: str) -> dict[str, Any]:
    """policy-sweep.sh 출력에서 환경별 Enforce 위반 여부 추출 (✘ <env> 행)."""
    failed: list[str] = []
    for line in stdout.splitlines():
        s = line.strip()
        if s.startswith("✘"):
            parts = s[1:].strip().split()
            if parts:
                failed.append(parts[0])
    return {"passed": not failed, "failed": failed}


def parse_kubeconform_output(stdout: str) -> dict[str, Any]:
    """kubeconform.sh 출력에서 검증한 차트 목록과 invalid/error 행 추출."""
    charts: list[str] = []
    violations: list[str] = []
    for line in stdout.splitlines():
        s = line.strip()
        if s.startswith("▶") and "kubeconform" in s:
            charts.append(s[1:].rsplit("—", 1)[0].strip())
        elif "invalid" in s.lower() or s.lower().startswith("error"):
            violations.append(s)
    return {"charts": charts, "violations": violations}


def parse_cross_chart_output(stdout: str) -> dict[str, Any]:
    """validate-cross-chart-refs.sh 출력에서 dangling ref(✗ 행) 추출."""
    dangling: list[str] = []
    for line in stdout.splitlines():
        s = line.strip()
        if s.startswith("✗"):
            dangling.append(s[1:].strip())
    return {"passed": not dangling, "dangling": dangling}


_SYNC_MISMATCH_RE = re.compile(r"^✗\s+(\[\w+\].*)$")


def parse_values_sync_output(stdout: str) -> dict[str, Any]:
    """values-sync-check.sh 출력에서 불일치 키(✗ [env] desc 행) 추출."""
    mismatches: list[str] = []
    for line in stdout.splitlines():
        m = _SYNC_MISMATCH_RE.match(line.strip())
        if m:
            mismatches.append(m.group(1).strip())
    return {"passed": not mismatches, "mismatches": mismatches}


def _split_docs(rendered: str) -> list[str]:
    return [d for d in re.split(r"(?m)^---\s*$", rendered) if d.strip()]


def _scan_field(doc: str, key: str) -> str | None:
    m = re.search(rf"(?m)^\s*{re.escape(key)}:\s*(.+?)\s*$", doc)
    return m.group(1).strip() if m else None


def extract_resources(rendered: str) -> list[dict[str, str]]:
    """helm 렌더 YAML 멀티독에서 {kind, name} 목록 추출."""
    out: list[dict[str, str]] = []
    for doc in _split_docs(rendered):
        kind = _scan_field(doc, "kind")
        name = _scan_field(doc, "name")
        if kind and name:
            out.append({"kind": kind, "name": name})
    return out


def _index_by_name(rendered: str) -> dict[str, str]:
    idx: dict[str, str] = {}
    for doc in _split_docs(rendered):
        name = _scan_field(doc, "name")
        if name:
            idx[name] = doc
    return idx


def _replicas(doc: str) -> int | None:
    v = _scan_field(doc, "replicas")
    return int(v) if v and v.isdigit() else None


def _images(doc: str) -> list[str]:
    return re.findall(r"(?m)^\s*-?\s*image:\s*(.+?)\s*$", doc)


def classify_render_risks(rendered_before: str, rendered_after: str) -> list[dict[str, str]]:
    """before/after 렌더 결과 비교 → 위험 변경 분류(replicas 감소/image 변경/리소스 제거/probe 제거)."""
    before = _index_by_name(rendered_before)
    after = _index_by_name(rendered_after)
    risks: list[dict[str, str]] = []

    for name, b_doc in before.items():
        if name not in after:
            risks.append({"type": "resource_removed", "name": name, "detail": "리소스가 렌더 결과에서 사라짐"})
            continue
        a_doc = after[name]

        rb, ra = _replicas(b_doc), _replicas(a_doc)
        if rb is not None and ra is not None and ra < rb:
            risks.append({"type": "replicas_decrease", "name": name, "detail": f"{rb} → {ra}"})

        ib, ia = _images(b_doc), _images(a_doc)
        if ib != ia:
            risks.append({"type": "image_change", "name": name, "detail": f"{ib} → {ia}"})

        if ("livenessProbe" in b_doc and "livenessProbe" not in a_doc) or (
            "readinessProbe" in b_doc and "readinessProbe" not in a_doc
        ):
            risks.append({"type": "probe_removed", "name": name, "detail": "liveness/readiness probe 제거"})

    return risks


# ---- subprocess helper -------------------------------------------------------


def _run(script: str, args: list[str] | None = None, env: dict[str, str] | None = None) -> dict[str, Any]:
    repo = config.repo("MIS-GitOps")
    cmd = [str(repo / "scripts" / script), *(args or [])]
    run_env = None
    if env:
        import os

        run_env = {**os.environ, **env}
    try:
        r = subprocess.run(
            cmd,
            cwd=str(repo),
            capture_output=True,
            text=True,
            timeout=_TIMEOUT,
            env=run_env,
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"{script} timeout ({_TIMEOUT}s)", "stdout": "", "stderr": ""}
    return {
        "ok": r.returncode == 0,
        "returncode": r.returncode,
        "stdout": r.stdout,
        "stderr": r.stderr.strip()[:500],
    }


# ---- tool 등록 ---------------------------------------------------------------


def register(mcp: Any) -> None:
    @mcp.tool()
    def gitops_set_image_tag(env: str, repository: str, new_tag: str, confirm: bool = False) -> dict[str, Any]:
        """GitOps values 의 image tag write-back (쓰기 — 파일 변경). env=dev|stg|live, repository='ep-be-eam/eam-api', new_tag=git SHA 기반 immutable tag(mutable 거부). confirm=False 면 실행할 명령만 반환(dry-run)."""
        validate_set_image_args(env, repository, new_tag)
        if not confirm:
            return {
                "dry_run": True,
                "command": f"scripts/set-image-tag.sh {env} {repository} {new_tag}",
                "note": "confirm=true 로 다시 호출",
            }
        res = _run("set-image-tag.sh", [env, repository, new_tag])
        if not res["ok"]:
            return {"ok": False, "error": res.get("error") or res["stderr"], "stdout": res.get("stdout", "")}
        return {"ok": True, **parse_set_image_output(res["stdout"]), "raw": res["stdout"]}

    @mcp.tool()
    def gitops_policy_sweep(env: str = "all", chart_filter: str | None = None) -> dict[str, Any]:
        """Kyverno admission 정적 재현 (read-only). 스크립트는 dev/stg/live 전수 검사. env='all' 이면 전체, 특정 env 면 결과 필터. chart_filter=차트명 부분일치로 출력 필터."""
        res = _run("policy-sweep.sh")
        parsed = parse_policy_output(res["stdout"])
        if env != "all":
            parsed["failed"] = [e for e in parsed["failed"] if e == env]
            parsed["passed"] = not parsed["failed"]
        return {**parsed, "raw": res["stdout"], "stderr": res["stderr"]}

    @mcp.tool()
    def gitops_kubeconform(env: str = "all", kube_version: str = "1.30.0", chart_filter: str | None = None) -> dict[str, Any]:
        """helm template → K8s/CRD schema 검증 (read-only). 스크립트는 전 chart × dev/stg/live 검사. kube_version=대상 K8s 버전(KUBE_VERSION env). env/chart_filter 로 결과 필터."""
        res = _run("kubeconform.sh", env={"KUBE_VERSION": kube_version})
        parsed = parse_kubeconform_output(res["stdout"])
        if env != "all":
            parsed["charts"] = [c for c in parsed["charts"] if f"({env})" in c]
        if chart_filter:
            parsed["charts"] = [c for c in parsed["charts"] if chart_filter in c]
        return {"ok": res["ok"], **parsed, "raw": res["stdout"], "stderr": res["stderr"]}

    @mcp.tool()
    def gitops_validate_cross_chart_refs(env: str = "all") -> dict[str, Any]:
        """gateway ↔ workload 매니페스트 참조 정합 검증 (read-only). HTTPRoute/SecurityPolicy targetRefs·backendRefs dangling 검출. 스크립트는 전 env 검사, env 인자는 보고용."""
        res = _run("validate-cross-chart-refs.sh")
        return {**parse_cross_chart_output(res["stdout"]), "raw": res["stdout"], "stderr": res["stderr"]}

    @mcp.tool()
    def gitops_values_sync_check(env: str = "all") -> dict[str, Any]:
        """cross-chart 공유 키 동기화 검증 (read-only). shared/gateway 공통 키 불일치 검출. 스크립트는 전 env 검사, env 인자는 보고용."""
        res = _run("values-sync-check.sh")
        return {**parse_values_sync_output(res["stdout"]), "raw": res["stdout"], "stderr": res["stderr"]}

    @mcp.tool()
    def gitops_helm_render_diff(chart_path: str, env: str, base_ref: str = "HEAD~1", compare_ref: str | None = None) -> dict[str, Any]:
        """차트 렌더 결과의 위험 변경 분류 (read-only). chart_path=차트 경로(예 charts/backend-eam), env=dev|stg|live. base_ref(git ref)의 차트와 현재 worktree 를 각각 helm template 후 replicas 감소/image 변경/리소스 제거/probe 제거를 분류. ref 추출 불가 시 현재 렌더 리소스 목록만 반환."""
        if env not in _ENVS:
            raise ValueError(f"env 는 dev|stg|live 만 허용: {env!r}")
        repo = config.repo("MIS-GitOps")
        values = f"{chart_path}/values-{env}.yaml"

        def _helm(cp: str) -> tuple[bool, str]:
            try:
                r = subprocess.run(
                    ["helm", "template", cp, "-f", f"{cp}/values-{env}.yaml"],
                    cwd=str(repo), capture_output=True, text=True, timeout=_TIMEOUT,
                )
            except (subprocess.TimeoutExpired, FileNotFoundError) as e:
                return False, str(e)
            return r.returncode == 0, r.stdout if r.returncode == 0 else r.stderr.strip()[:500]

        after_ok, after = _helm(chart_path)
        if not after_ok:
            return {"ok": False, "error": f"현재 worktree 렌더 실패: {after}", "values": values}

        target = compare_ref or base_ref
        try:
            wt = subprocess.run(
                ["git", "-C", str(repo), "worktree", "add", "--detach", "--quiet",
                 "/tmp/gitops-render-diff", target],
                capture_output=True, text=True, timeout=30,
            )
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            wt = None
            wt_err = str(e)
        else:
            wt_err = wt.stderr.strip()[:300]

        if wt is None or wt.returncode != 0:
            return {
                "ok": True,
                "ref_compare": False,
                "note": f"base_ref 추출 불가({wt_err}). 현재 렌더 리소스 목록만 반환.",
                "resources": extract_resources(after),
            }
        try:
            r = subprocess.run(
                ["helm", "template", chart_path, "-f", values],
                cwd="/tmp/gitops-render-diff", capture_output=True, text=True, timeout=_TIMEOUT,
            )
            before = r.stdout if r.returncode == 0 else ""
        finally:
            subprocess.run(
                ["git", "-C", str(repo), "worktree", "remove", "--force", "/tmp/gitops-render-diff"],
                capture_output=True, text=True, timeout=30,
            )
        return {
            "ok": True,
            "ref_compare": True,
            "base_ref": target,
            "risks": classify_render_risks(before, after),
            "resources": extract_resources(after),
        }
