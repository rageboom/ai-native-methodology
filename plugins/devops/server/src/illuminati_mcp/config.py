"""자격증명 로딩(쉘 env 우선, .env 폴백) + 도메인별 엔드포인트 해석."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

# plugins/devops/server/src/illuminati_mcp/config.py — 소스가 플러그인 레포에 있을 때 parents[6] = 워크스페이스 루트.
# 플러그인 캐시에서 실행될 땐 이 추정이 틀리므로 launcher 가 ILLUMINATI_CODE_ROOT 를 항상 export 한다.
_CODE_ROOT = Path(__file__).resolve().parents[6]


def code_root() -> Path:
    return Path(os.environ.get("ILLUMINATI_CODE_ROOT", str(_CODE_ROOT)))


def repo(name: str) -> Path:
    return code_root() / name


def _env_path() -> Path | None:
    """자격증명 .env 탐색 — ILLUMINATI_ENV_FILE > <code_root>/MIS-DevOps/platform-automation/.env. 없으면 쉘 export 만 사용."""
    override = os.environ.get("ILLUMINATI_ENV_FILE")
    if override:
        p = Path(override)
        return p if p.exists() else None
    legacy = code_root() / "MIS-DevOps" / "platform-automation" / ".env"
    return legacy if legacy.exists() else None


def load_env() -> None:
    env_file = _env_path()
    if env_file is None:
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def _require(name: str) -> str:
    v = os.environ.get(name)
    if not v:
        raise RuntimeError(f"환경변수 {name} 미설정 (tools/.env 확인)")
    return v


# Grafana datasource UID (reference-grafana-local-query memory 기준)
MIMIR_UID = "prometheus"
LOKI_UID = "loki"
TEMPO_UID = "tempo"


@lru_cache
def grafana(env: str = "prod") -> tuple[str, str]:
    """(url, api_key) — env 'prod'|'stg'|'dev'. 키 GRAFANA_URL(prod)/GRAFANA_{STG,DEV}_URL + 대응 API_KEY."""
    if env == "dev":
        return _require("GRAFANA_DEV_URL").rstrip("/"), _require("GRAFANA_DEV_API_KEY")
    if env == "stg":
        return _require("GRAFANA_STG_URL").rstrip("/"), _require("GRAFANA_STG_API_KEY")
    if env == "prod":
        return _require("GRAFANA_URL").rstrip("/"), _require("GRAFANA_API_KEY")
    raise ValueError(f"env 는 'prod'|'stg'|'dev' 만 허용: {env!r}")


@lru_cache
def jira() -> tuple[str, str]:
    """(base_url, bearer_token). PAT(JIRA_TOKEN) 전용 — basic-auth 폐지(CAPTCHA 회피)."""
    return _require("JIRA_URL").rstrip("/"), _require("JIRA_TOKEN")


@lru_cache
def confluence() -> tuple[str, str]:
    """(base_url, bearer_token)."""
    return _require("CONFLUENCE_URL").rstrip("/"), _require("WIKI_TOKEN")


@lru_cache
def jenkins(env: str = "dev") -> tuple[str, str, str]:
    """(base_url, user, token) — env dev|stg|live. 환경마다 Jenkins 네이티브 분리(공용 가정 금지).

    키 JENKINS_{DEV,STG,LIVE}_{URL,USER,TOKEN}, 없으면 legacy JENKINS_{URL,USER,TOKEN} 폴백.
    API 토큰은 Jenkins 인스턴스별 발급이므로 실사용은 per-env 키 권장.
    """
    if env not in ("dev", "stg", "live"):
        raise ValueError(f"env 는 dev|stg|live: {env!r}")
    e = env.upper()

    def pick(suffix: str) -> str:
        return os.environ.get(f"JENKINS_{e}_{suffix}") or _require(f"JENKINS_{suffix}")

    return pick("URL").rstrip("/"), pick("USER"), pick("TOKEN")


@lru_cache
def harbor(env: str = "dev") -> tuple[str, str, str]:
    """(url, robot_user, robot_pass) — env dev|stg|live. 자격은 .env HARBOR_{DEV,STG,LIVE}_{URL,USER,PASS}.

    환경별 Harbor 3대 분리. robot account REST 자격으로 도달 — 로컬 네트워크 도달 여부는 미검증.
    """
    if env not in ("dev", "stg", "live"):
        raise ValueError(f"env 는 dev|stg|live: {env!r}")
    e = env.upper()
    return _require(f"HARBOR_{e}_URL").rstrip("/"), _require(f"HARBOR_{e}_USER"), _require(f"HARBOR_{e}_PASS")
