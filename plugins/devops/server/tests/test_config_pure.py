import os
from pathlib import Path

import pytest

from illuminati_mcp import config


def test_repo_joins_code_root(monkeypatch):
    monkeypatch.setenv("ILLUMINATI_CODE_ROOT", "/tmp/code")
    assert config.repo("MIS-GitOps") == Path("/tmp/code/MIS-GitOps")


def test_code_root_default_points_to_workspace():
    # config.py 가 .../code/MIS-DevOps/.../illuminati_mcp/config.py 이므로 루트는 code/
    root = config.code_root()
    assert root.name == "code"
    assert (root / "MIS-DevOps").exists()


def test_harbor_env_validation():
    with pytest.raises(ValueError):
        config.harbor("prod")


def test_harbor_reads_env(monkeypatch):
    config.harbor.cache_clear()
    monkeypatch.setenv("HARBOR_DEV_URL", "https://dev-mis-registry.smiledev.net/")
    monkeypatch.setenv("HARBOR_DEV_USER", "robot$scan")
    monkeypatch.setenv("HARBOR_DEV_PASS", "secret")
    url, user, pw = config.harbor("dev")
    assert url == "https://dev-mis-registry.smiledev.net"  # trailing slash stripped
    assert user == "robot$scan"
    assert pw == "secret"
    config.harbor.cache_clear()


def test_grafana_stg_reads_env(monkeypatch):
    config.grafana.cache_clear()
    monkeypatch.setenv("GRAFANA_STG_URL", "https://stg-mis-grafana.smiledev.net/")
    monkeypatch.setenv("GRAFANA_STG_API_KEY", "k")
    url, key = config.grafana("stg")
    assert url == "https://stg-mis-grafana.smiledev.net"
    assert key == "k"
    config.grafana.cache_clear()


def test_grafana_env_validation():
    config.grafana.cache_clear()
    with pytest.raises(ValueError):
        config.grafana("live")


def test_jenkins_per_env_with_legacy_fallback(monkeypatch):
    config.jenkins.cache_clear()
    monkeypatch.setenv("JENKINS_DEV_URL", "https://dev-mis-jenkins.smiledev.net/")
    monkeypatch.setenv("JENKINS_URL", "https://mis-jenkins.smilegate.net")
    monkeypatch.setenv("JENKINS_USER", "dohyeonkim")
    monkeypatch.setenv("JENKINS_TOKEN", "t")
    monkeypatch.delenv("JENKINS_DEV_USER", raising=False)
    monkeypatch.delenv("JENKINS_DEV_TOKEN", raising=False)
    url, user, token = config.jenkins("dev")
    assert url == "https://dev-mis-jenkins.smiledev.net"
    assert user == "dohyeonkim" and token == "t"
    config.jenkins.cache_clear()
    monkeypatch.delenv("JENKINS_LIVE_URL", raising=False)
    monkeypatch.delenv("JENKINS_LIVE_USER", raising=False)
    monkeypatch.delenv("JENKINS_LIVE_TOKEN", raising=False)
    url2, _, _ = config.jenkins("live")
    assert url2 == "https://mis-jenkins.smilegate.net"
    config.jenkins.cache_clear()


def test_jenkins_env_validation():
    config.jenkins.cache_clear()
    with pytest.raises(ValueError):
        config.jenkins("prod")
