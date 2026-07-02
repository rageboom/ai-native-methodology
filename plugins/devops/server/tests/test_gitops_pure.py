import pytest

from illuminati_mcp import gitops


# ---- validate_set_image_args ----

def test_validate_set_image_args_ok():
    gitops.validate_set_image_args("dev", "ep-be-eam/eam-api", "2026.06.08-a1b2c3d")


@pytest.mark.parametrize("env", ["prod", "DEV", "", "production"])
def test_validate_set_image_args_bad_env(env):
    with pytest.raises(ValueError):
        gitops.validate_set_image_args(env, "ep-be-eam/eam-api", "2026.06.08-a1b2c3d")


@pytest.mark.parametrize("tag", ["", "latest", "stable", "main", "master", "kubernetes-v1.0.0prev"])
def test_validate_set_image_args_mutable_tag(tag):
    with pytest.raises(ValueError):
        gitops.validate_set_image_args("dev", "ep-be-eam/eam-api", tag)


def test_validate_set_image_args_empty_repo():
    with pytest.raises(ValueError):
        gitops.validate_set_image_args("dev", "", "2026.06.08-a1b2c3d")


# ---- parse_set_image_output ----

def test_parse_set_image_output():
    out = (
        "  charts/backend-eam/values-dev.yaml : 1 tag 갱신\n"
        "  charts/batch/values-dev.yaml : 19 tag 갱신\n"
        "총 20 tag → '2026.06.08-a1b2c3d' (env=dev, repository=ep-be-eam/eam-api, files=2)\n"
    )
    r = gitops.parse_set_image_output(out)
    assert r["count"] == 20
    assert r["changed_files"] == [
        "charts/backend-eam/values-dev.yaml",
        "charts/batch/values-dev.yaml",
    ]


def test_parse_set_image_output_empty():
    r = gitops.parse_set_image_output("")
    assert r == {"changed_files": [], "count": 0}


# ---- parse_policy_output ----

def test_parse_policy_output_passed():
    out = "▶ dev — kyverno apply (clusters/dev/kyverno-policies, 5 policies)\n"
    r = gitops.parse_policy_output(out)
    assert r == {"passed": True, "failed": []}


def test_parse_policy_output_failed():
    out = (
        "▶ dev — kyverno apply (clusters/dev/kyverno-policies, 5 policies)\n"
        "✘ dev — Enforce 정책 위반. 머지 시 admission deny 로 Pod 생성이 차단된다.\n"
        "▶ stg — kyverno apply (clusters/stg/kyverno-policies, 5 policies)\n"
    )
    r = gitops.parse_policy_output(out)
    assert r["passed"] is False
    assert r["failed"] == ["dev"]


# ---- parse_kubeconform_output ----

def test_parse_kubeconform_output():
    out = (
        "▶ charts/backend-eam (dev) — kubeconform\n"
        "Summary: 12 resources found parsing stdin - Valid: 12, Invalid: 0, Errors: 0, Skipped: 3\n"
        "▶ charts/batch (dev) — kubeconform\n"
        "stdin - Deployment x is invalid: problem\n"
        "Summary: 5 resources found - Valid: 4, Invalid: 1, Errors: 0, Skipped: 0\n"
    )
    r = gitops.parse_kubeconform_output(out)
    assert r["charts"] == ["charts/backend-eam (dev)", "charts/batch (dev)"]
    assert any("invalid" in v for v in r["violations"])


# ---- parse_cross_chart_output ----

def test_parse_cross_chart_output_ok():
    out = "▶ dev — cross-chart manifest refs\n✓ 모든 cross-chart manifest refs 정합\n"
    r = gitops.parse_cross_chart_output(out)
    assert r == {"passed": True, "dangling": []}


def test_parse_cross_chart_output_dangling():
    out = (
        "▶ dev — cross-chart manifest refs\n"
        "  ✗ HTTPRoute backendRefs.name 'eam-api' 가 workload Service 에 존재하지 않음\n"
    )
    r = gitops.parse_cross_chart_output(out)
    assert r["passed"] is False
    assert r["dangling"] == [
        "HTTPRoute backendRefs.name 'eam-api' 가 workload Service 에 존재하지 않음"
    ]


# ---- parse_values_sync_output ----

def test_parse_values_sync_output_ok():
    out = "✓ 모든 cross-chart 공유 키 동기화 OK (schema: sync-schema.yaml)\n"
    r = gitops.parse_values_sync_output(out)
    assert r == {"passed": True, "mismatches": []}


def test_parse_values_sync_output_mismatch():
    out = (
        "  ✗ [dev] frontend-fo apps 동기화\n"
        "      gateway.apps = a\n"
        "      shared.apps = b\n"
        "  ✗ [stg] tlm excelApi enabled\n"
    )
    r = gitops.parse_values_sync_output(out)
    assert r["passed"] is False
    assert r["mismatches"] == ["[dev] frontend-fo apps 동기화", "[stg] tlm excelApi enabled"]


# ---- extract_resources ----

def test_extract_resources():
    rendered = (
        "apiVersion: apps/v1\n"
        "kind: Deployment\n"
        "metadata:\n"
        "  name: eam-api\n"
        "---\n"
        "apiVersion: v1\n"
        "kind: Service\n"
        "metadata:\n"
        "  name: eam-api\n"
    )
    r = gitops.extract_resources(rendered)
    assert {"kind": "Deployment", "name": "eam-api"} in r
    assert {"kind": "Service", "name": "eam-api"} in r


def test_extract_resources_empty():
    assert gitops.extract_resources("") == []


# ---- classify_render_risks ----

def test_classify_render_risks_replica_decrease():
    before = "kind: Deployment\nmetadata:\n  name: eam-api\nspec:\n  replicas: 3\n"
    after = "kind: Deployment\nmetadata:\n  name: eam-api\nspec:\n  replicas: 1\n"
    risks = gitops.classify_render_risks(before, after)
    assert any(r["type"] == "replicas_decrease" and r["name"] == "eam-api" for r in risks)


def test_classify_render_risks_image_change():
    before = "kind: Deployment\nmetadata:\n  name: eam-api\nspec:\n  template:\n    spec:\n      containers:\n      - image: harbor/eam:1\n"
    after = "kind: Deployment\nmetadata:\n  name: eam-api\nspec:\n  template:\n    spec:\n      containers:\n      - image: harbor/eam:2\n"
    risks = gitops.classify_render_risks(before, after)
    assert any(r["type"] == "image_change" for r in risks)


def test_classify_render_risks_resource_removed():
    before = "kind: Service\nmetadata:\n  name: gone\n"
    after = ""
    risks = gitops.classify_render_risks(before, after)
    assert any(r["type"] == "resource_removed" and r["name"] == "gone" for r in risks)


def test_classify_render_risks_none():
    same = "kind: Deployment\nmetadata:\n  name: x\nspec:\n  replicas: 2\n"
    assert gitops.classify_render_risks(same, same) == []
