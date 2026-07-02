"""Backend tools — 4개 백엔드 레포 빌드 스택/배치 Job/Dockerfile 드리프트 정적 분석(읽기, 사내망 불필요)."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from . import config

# ---- 순수 로직 (테스트 대상, 사내망 불필요) ----------------------------------

_DIST_RE = re.compile(r"gradle-(\d+(?:\.\d+){0,2})-(?:bin|all)\.zip")
_TOML_VER_RE = re.compile(r'^\s*([A-Za-z0-9_.\-]+)\s*=\s*"([^"]+)"\s*$')
_TOML_INLINE_VER_RE = re.compile(r'^\s*([A-Za-z0-9_.\-]+)\s*=\s*\{.*\bversion\s*=\s*"([^"]+)".*\}\s*$')

_BUILD_KEYS = ("gradle", "java", "springBoot", "springDependencyManagement", "jackson", "otel-api")

_PROP_ALIASES = {
    "springBoot": ("springBootVersion",),
    "springDependencyManagement": ("springDependencyManagementVersion",),
    "jackson": ("jacksonDatatypeVersion", "jacksonVersion"),
    "otel-api": ("opentelemetryApiVersion", "opentelemetryInstrumentationVersion"),
    "java": ("javaVersion",),
}
_TOML_ALIASES = {
    "springBoot": ("springBoot",),
    "springDependencyManagement": ("springDependencyManagement",),
    "jackson": ("jackson",),
    "otel-api": ("opentelemetry-api", "opentelemetryInstrumentation"),
}


def parse_gradle_distribution(text: str) -> str | None:
    for line in text.splitlines():
        if "distributionUrl" not in line:
            continue
        m = _DIST_RE.search(line)
        if m:
            return m.group(1)
    return None


def parse_versions_toml(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("["):
            continue
        m = _TOML_INLINE_VER_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2)
            continue
        m = _TOML_VER_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def parse_gradle_properties(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        k, v = stripped.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def extract_build_keys(toml_versions: dict, props: dict, hardcoded_java: str | None) -> dict[str, str | None]:
    out: dict[str, str | None] = {}
    for key in ("springBoot", "springDependencyManagement", "jackson", "otel-api"):
        val = None
        for alias in _TOML_ALIASES.get(key, ()):
            if alias in toml_versions:
                val = toml_versions[alias]
                break
        if val is None:
            for alias in _PROP_ALIASES.get(key, ()):
                if alias in props:
                    val = props[alias]
                    break
        out[key] = val
    java = props.get("javaVersion") or hardcoded_java
    out["java"] = java
    return out


def detect_drift(matrix: dict[str, dict]) -> list[dict[str, Any]]:
    keys: set[str] = set()
    for vals in matrix.values():
        keys.update(vals.keys())
    drift = []
    for key in sorted(keys):
        present = {repo: vals[key] for repo, vals in matrix.items()
                   if vals.get(key) is not None}
        if len(set(present.values())) > 1:
            drift.append({"key": key, "values": present})
    return drift


def parse_run_mode(text: str) -> str:
    m = re.search(r"^\s*mode:\s*(\S+)", text, re.MULTILINE)
    if m and m.group(1) == "scheduled":
        return "scheduled"
    return "oneshot"


def classify_job_mode(run_src: str) -> str:
    return "scheduled" if run_src == "scheduled" else "oneshot"


def parse_scheduled_jobs_yml(text: str) -> list[dict[str, str]]:
    lines = text.splitlines()
    start, base_indent = None, 0
    for i, line in enumerate(lines):
        m = re.match(r"^(\s*)scheduled-jobs:\s*$", line)
        if m:
            start, base_indent = i + 1, len(m.group(1))
            break
    if start is None:
        return []
    jobs: list[dict[str, str]] = []
    cur: dict[str, str] | None = None
    for line in lines[start:]:
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        if indent <= base_indent:
            break
        key_m = re.match(r"^\s+([A-Za-z0-9_]+):\s*(?:#.*)?$", line)
        if key_m and indent == base_indent + 2:
            cur = {"key": key_m.group(1), "name": "", "cron": ""}
            jobs.append(cur)
            continue
        if cur is None:
            continue
        nm = re.match(r"^\s+name:\s*(\S.*?)\s*$", line)
        if nm:
            cur["name"] = nm.group(1).strip().strip('"')
            continue
        cm = re.match(r'^\s+cron:\s*"?([^"#]+?)"?\s*(?:#.*)?$', line)
        if cm:
            cur["cron"] = cm.group(1).strip()
    return jobs


def parse_dockerfile(text: str) -> dict[str, Any]:
    froms = re.findall(r"^FROM\s+(\S+)", text, re.MULTILINE)
    args = dict(re.findall(r"^ARG\s+([A-Za-z0-9_]+)\s*=\s*(\S+)", text, re.MULTILINE))
    base = froms[-1] if froms else None
    if base:
        base = re.sub(r"\s+AS\s+\S+$", "", base, flags=re.IGNORECASE)
        for name, val in args.items():
            base = base.replace(f"${{{name}}}", val).replace(f"${name}", val)
    users = re.findall(r"^USER\s+(\S+)", text, re.MULTILINE)
    user = users[-1] if users else None
    registry = None
    if base and "/" in base:
        head = base.split("/", 1)[0]
        if "." in head or ":" in head:
            registry = head
    return {
        "base_image": base,
        "registry": registry,
        "user": user,
        "multistage": len(froms) > 1,
    }


def audit_nonroot(parsed: dict) -> bool:
    user = parsed.get("user")
    return bool(user) and user != "root" and user != "0"


def env_from_dockerfile_path(path: str) -> str:
    parts = Path(path).parts
    for anchor in ("deploy", "container"):
        if anchor in parts:
            idx = parts.index(anchor)
            if idx + 1 < len(parts):
                return parts[idx + 1]
    return parts[-2] if len(parts) >= 2 else ""


# ---- 파일 접근 helper --------------------------------------------------------

def _read(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def _default_backend_repos() -> dict[str, Path]:
    return {
        "eam": config.repo("eam") / "ep-be-eam",
        "tlm": config.repo("tlm") / "ep-be-tlm",
        "gea": config.repo("gea"),
        "observer": config.repo("sgh-mis-observer"),
        "common": config.repo("mis-backend-common"),
    }


def _collect_matrix_row(root: Path) -> dict[str, str | None]:
    wrapper = _read(root / "gradle" / "wrapper" / "gradle-wrapper.properties")
    gradle_ver = parse_gradle_distribution(wrapper) if wrapper else None
    toml = _read(root / "gradle" / "libs.versions.toml")
    toml_versions = parse_versions_toml(toml) if toml else {}
    props_text = _read(root / "gradle.properties")
    props = parse_gradle_properties(props_text) if props_text else {}
    hardcoded_java = None
    for build_file in ("build.gradle", "build.gradle.kts"):
        bt = _read(root / build_file)
        if not bt:
            continue
        m = re.search(r'sourceCompatibility\s*=\s*"?(\d+)"?', bt)
        if m and "javaVersion" not in m.group(0):
            hardcoded_java = m.group(1)
        m2 = re.search(r"jvmToolchain\((\d+)\)", bt)
        if m2:
            hardcoded_java = m2.group(1)
    row = extract_build_keys(toml_versions, props, hardcoded_java)
    row["gradle"] = gradle_ver
    return row


def _glob_dockerfiles(root: Path) -> list[Path]:
    out = []
    for p in root.rglob("Dockerfile"):
        rel = p.relative_to(root).parts
        if "build" in rel or "node_modules" in rel:
            continue
        out.append(p)
    return sorted(out)


def _find_batch_yml(root: Path) -> list[Path]:
    out = []
    for p in root.rglob("application-batch-*.yml"):
        rel = p.relative_to(root).parts
        if "build" in rel:
            continue
        out.append(p)
    return sorted(out)


# ---- tool 등록 ---------------------------------------------------------------

def register(mcp: Any) -> None:
    @mcp.tool()
    def backend_build_matrix(
        repos: list[str] | None = None, keys: list[str] | None = None
    ) -> dict[str, Any]:
        """백엔드 레포 빌드 스택 버전 매트릭스 + 드리프트 집계.

        repos=대상 레포 키(eam/tlm/gea/observer/common), 기본 전체.
        keys=추출 키 필터(gradle/java/springBoot/springDependencyManagement/jackson/otel-api), 기본 전체.
        """
        targets = _default_backend_repos()
        names = repos or list(targets)
        wanted = keys or list(_BUILD_KEYS)
        matrix: dict[str, dict] = {}
        for name in names:
            root = targets.get(name)
            if root is None or not root.exists():
                matrix[name] = {"_missing": True}
                continue
            row = _collect_matrix_row(root)
            matrix[name] = {k: row.get(k) for k in wanted}
        drift = detect_drift({n: v for n, v in matrix.items() if not v.get("_missing")})
        return {"matrix": matrix, "drift": drift}

    @mcp.tool()
    def backend_batch_job_inventory(
        repos: list[str] | None = None, mode_filter: str = "all"
    ) -> dict[str, Any]:
        """배치 Job 카탈로그(eam/tlm/gea). observer 는 배치 없음.

        cron 은 application-batch-{env}.yml 에 외부화되어 있어 yml 을 파싱한다.
        mode_filter=scheduled|oneshot|all. mode 는 spring.batch.run.mode 로 판정.
        """
        targets = {k: _default_backend_repos()[k] for k in ("eam", "tlm", "gea")}
        names = repos or list(targets)
        result: dict[str, Any] = {}
        total = 0
        for name in names:
            root = targets.get(name)
            if root is None or not root.exists():
                result[name] = {"_missing": True, "jobs": []}
                continue
            ymls = _find_batch_yml(root)
            prod_yml = next((y for y in ymls if y.name.endswith("-prod.yml")), None)
            src = prod_yml or (ymls[0] if ymls else None)
            jobs_out = []
            if src is not None:
                text = _read(src) or ""
                mode = classify_job_mode(parse_run_mode(text))
                rel = str(src.relative_to(config.code_root()))
                for j in parse_scheduled_jobs_yml(text):
                    if mode_filter != "all" and mode != mode_filter:
                        continue
                    jobs_out.append({
                        "name": j["name"] or j["key"],
                        "mode": mode,
                        "cron": j["cron"] or None,
                        "source_path": rel,
                    })
            result[name] = {"jobs": jobs_out, "count": len(jobs_out)}
            total += len(jobs_out)
        result["total"] = total
        return result

    @mcp.tool()
    def backend_dockerfile_drift_audit(
        repos: list[str] | None = None, checks: list[str] | None = None
    ) -> dict[str, Any]:
        """레포×환경 Dockerfile 의 base image/registry/USER/multistage 비교 + 보안 회귀 플래그.

        repos=대상 레포 키, 기본 전체. checks=nonroot|registry-match|multistage, 기본 전체.
        Dockerfile 위치는 레포마다 달라 glob 으로 탐색한다.
        """
        targets = _default_backend_repos()
        names = repos or list(targets)
        active = checks or ["nonroot", "registry-match", "multistage"]
        rows = []
        violations = []
        registries: dict[str, set[str]] = {}
        for name in names:
            root = targets.get(name)
            if root is None or not root.exists():
                continue
            for df in _glob_dockerfiles(root):
                text = _read(df) or ""
                p = parse_dockerfile(text)
                env = env_from_dockerfile_path(str(df.relative_to(root)))
                rel = str(df.relative_to(config.code_root()))
                rows.append({
                    "repo": name, "env": env, "base_image": p["base_image"],
                    "registry": p["registry"], "user": p["user"],
                    "multistage": p["multistage"], "source_path": rel,
                })
                if p["registry"]:
                    registries.setdefault(name, set()).add(p["registry"])
                if "nonroot" in active and not audit_nonroot(p):
                    violations.append({"repo": name, "env": env, "issue": "root 실행(USER 미설정/root)", "source_path": rel})
                if "multistage" in active and not p["multistage"]:
                    violations.append({"repo": name, "env": env, "issue": "single-stage(빌드 산출물 미분리)", "source_path": rel})
        if "registry-match" in active:
            for name, regs in registries.items():
                if len(regs) > 1:
                    violations.append({"repo": name, "env": "*", "issue": f"registry 불일치: {sorted(regs)}"})
        return {"rows": rows, "violations": violations}
