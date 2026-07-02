from illuminati_mcp import inventory

# 실제 server-dev.md 포맷 축약본 (## 섹션 + Hostname/IP/Spec/Services/Port 표 + URLs 표)
_DEV_MD = """# DEV Environment Inventory

> Last updated: 2026-02-09
> User: eptmdev (common), geadev (GEA)

## Application Servers

| Hostname        | IP             | Spec        | Services                     | Port             |
|-----------------|----------------|-------------|------------------------------|------------------|
| odvkch-eptmap01 | 10.125.111.44  | 4C/8G/100G  | Nginx, TLM-API, EAM-API      | 80, 443, 8080    |
| odvkch-geabe01  | 10.125.111.81  | 4C/8G/100G  | GEA-API                      | 8080             |

## Infrastructure Servers

| Hostname        | IP             | Spec        | Services        | Port  |
|-----------------|----------------|-------------|-----------------|-------|
| odvkch-eptmrd01 | 10.125.111.11  | 4C/16G/100G | Redis 7.4.1     | 6379  |

## URLs

| Service | URL                                   |
|---------|---------------------------------------|
| Kong    | `https://dev-mis-kong.smiledev.net`   |
"""

# 실제 compose-v2-server-topology.md 포맷 축약본
_TOPO_MD = """# compose-v2 서버 토폴로지

| 환경 | 서버 | tier | 배치된 앱/서비스 |
|---|---|---|---|
| dev | odvkch-eptmap01 | backend | eam-api,tlm-api |
| dev | odvkch-geabe01 | backend | gea-api |
| stg | ostkch-eptmbe01 | backend | tlm-api |
"""


def test_parse_last_updated():
    assert inventory.parse_last_updated(_DEV_MD) == "2026-02-09"
    assert inventory.parse_last_updated("# no header") is None


def test_parse_inventory_md_columns():
    rows = inventory.parse_inventory_md(_DEV_MD)
    # URLs 표(Hostname 없음)는 제외, server 표 3행만
    assert len(rows) == 3
    first = rows[0]
    assert first["hostname"] == "odvkch-eptmap01"
    assert first["ip"] == "10.125.111.44"
    assert first["spec"] == "4C/8G/100G"
    assert first["services"] == "Nginx, TLM-API, EAM-API"
    assert first["port"] == "80, 443, 8080"
    assert first["section"] == "Application Servers"


def test_parse_inventory_md_section_assignment():
    rows = inventory.parse_inventory_md(_DEV_MD)
    redis = [r for r in rows if r["hostname"] == "odvkch-eptmrd01"][0]
    assert redis["section"] == "Infrastructure Servers"


def test_filter_rows_by_hostname():
    rows = inventory.parse_inventory_md(_DEV_MD)
    out = inventory.filter_rows(rows, "geabe")
    assert len(out) == 1
    assert out[0]["hostname"] == "odvkch-geabe01"


def test_filter_rows_by_ip():
    rows = inventory.parse_inventory_md(_DEV_MD)
    out = inventory.filter_rows(rows, "111.11")
    assert {r["hostname"] for r in out} == {"odvkch-eptmrd01"}


def test_filter_rows_by_service_case_insensitive():
    rows = inventory.parse_inventory_md(_DEV_MD)
    out = inventory.filter_rows(rows, "redis")
    assert len(out) == 1
    assert out[0]["hostname"] == "odvkch-eptmrd01"


def test_filter_rows_by_section_tier():
    rows = inventory.parse_inventory_md(_DEV_MD)
    out = inventory.filter_rows(rows, "infrastructure")
    assert {r["hostname"] for r in out} == {"odvkch-eptmrd01"}


def test_filter_rows_none_returns_all():
    rows = inventory.parse_inventory_md(_DEV_MD)
    assert inventory.filter_rows(rows, None) == rows
    assert inventory.filter_rows(rows, "  ") == rows


def test_parse_topology():
    topo = inventory.parse_topology(_TOPO_MD, "dev")
    assert topo == {
        "odvkch-eptmap01": "eam-api,tlm-api",
        "odvkch-geabe01": "gea-api",
    }


def test_join_apps():
    rows = inventory.parse_inventory_md(_DEV_MD)
    topo = inventory.parse_topology(_TOPO_MD, "dev")
    joined = inventory.join_apps(rows, topo)
    ap = [r for r in joined if r["hostname"] == "odvkch-eptmap01"][0]
    assert ap["apps"] == "eam-api,tlm-api"
    redis = [r for r in joined if r["hostname"] == "odvkch-eptmrd01"][0]
    assert "apps" not in redis
