from datetime import timedelta

import pytest

from illuminati_mcp import grafana


def test_parse_since():
    assert grafana.parse_since("1h") == timedelta(hours=1)
    assert grafana.parse_since("30m") == timedelta(minutes=30)
    assert grafana.parse_since("7d") == timedelta(days=7)
    assert grafana.parse_since(" 6h ") == timedelta(hours=6)


@pytest.mark.parametrize("bad", ["1w", "h", "10", "", "1.5h"])
def test_parse_since_invalid(bad):
    with pytest.raises(ValueError):
        grafana.parse_since(bad)


def test_appsel():
    assert grafana.appsel(None) == {"SEL": "", "SELA": ""}
    assert grafana.appsel("ep-be-tlm-api") == {"SEL": '{app="ep-be-tlm-api"}', "SELA": ',app="ep-be-tlm-api"'}


def test_apply_sel():
    sel = grafana.appsel("gea")
    assert grafana.apply_sel("jvm_threads_live__SEL__", sel) == 'jvm_threads_live{app="gea"}'
    assert grafana.apply_sel('m{area="heap"__SELA__}', sel) == 'm{area="heap",app="gea"}'
    none = grafana.appsel(None)
    assert grafana.apply_sel("jvm_threads_live__SEL__", none) == "jvm_threads_live"


@pytest.mark.parametrize(
    "name,expr,expected",
    [
        ("KafkaUnderReplicated", "", "kafka"),
        ("RedisDown", "", "redis"),
        ("HighHeapUsage", "jvm_memory_used_bytes", "jvm"),
        ("HikariPoolExhausted", "hikaricp_connections_active", "db"),
        ("High5xx", "http_server_requests_seconds_count", "http"),
        ("PodPending", "kube_pod_status_phase", "k8s"),
        ("SomethingElse", "weird_metric", "generic"),
    ],
)
def test_categorize(name, expr, expected):
    assert grafana.categorize(name, expr) == expected


def test_fmt_series_empty():
    assert "데이터 없음" in grafana.fmt_series({"data": {"result": []}})


def test_fmt_series_values():
    result = {"data": {"result": [{"metric": {"app": "gea"}, "values": [[0, "1"], [1, "2"], [2, "3.5"]]}]}}
    out = grafana.fmt_series(result)
    assert "gea" in out
    assert "현재=3.5" in out


def test_safe_label_value():
    assert grafana.safe_label_value("ep-be-gea-api") == "ep-be-gea-api"
    assert grafana.safe_label_value("jvm_.+") == "jvm_.+"


@pytest.mark.parametrize("bad", ['a"b', "a\\b", 'x"} or vector(1) #'])
def test_safe_label_value_injection(bad):
    with pytest.raises(ValueError):
        grafana.safe_label_value(bad)


def test_appsel_injection():
    with pytest.raises(ValueError):
        grafana.appsel('x"} or vector(1) #')
