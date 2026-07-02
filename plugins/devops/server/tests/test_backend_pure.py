from illuminati_mcp import backend


# ---- gradle distribution ----

def test_parse_gradle_distribution_relative():
    assert backend.parse_gradle_distribution("distributionUrl=../gradle-8.14.4-bin.zip") == "8.14.4"


def test_parse_gradle_distribution_bare():
    assert backend.parse_gradle_distribution("distributionUrl=gradle-8.14.2-bin.zip") == "8.14.2"


def test_parse_gradle_distribution_full_url_escaped():
    text = r"distributionUrl=https\://services.gradle.org/distributions/gradle-9.5.0-bin.zip"
    assert backend.parse_gradle_distribution(text) == "9.5.0"


def test_parse_gradle_distribution_missing():
    assert backend.parse_gradle_distribution("zipStoreBase=GRADLE_USER_HOME") is None


# ---- versions.toml ----

def test_parse_versions_toml_versions_block():
    text = '[versions]\nspringBoot = "3.1.2"\njackson = "2.15.2"\n[plugins]\nx = {}\n'
    v = backend.parse_versions_toml(text)
    assert v["springBoot"] == "3.1.2"
    assert v["jackson"] == "2.15.2"


def test_parse_versions_toml_inline_lib_version():
    text = '[libraries]\nopentelemetry-api = { module = "io.opentelemetry:opentelemetry-api", version = "1.59.0" }\n'
    v = backend.parse_versions_toml(text)
    assert v["opentelemetry-api"] == "1.59.0"


def test_parse_versions_toml_ignores_version_ref():
    text = '[libraries]\nfoo = { module = "x:y", version.ref = "jackson" }\n'
    v = backend.parse_versions_toml(text)
    assert "foo" not in v


# ---- gradle.properties ----

def test_parse_gradle_properties():
    text = "# comment\nspringBootVersion=3.1.2\n\njavaVersion=17\norg.gradle.jvmargs=-Xmx2g\n"
    p = backend.parse_gradle_properties(text)
    assert p["springBootVersion"] == "3.1.2"
    assert p["javaVersion"] == "17"
    assert p["org.gradle.jvmargs"] == "-Xmx2g"
    assert "# comment" not in p


# ---- canonical key extraction ----

def test_extract_build_keys_from_toml():
    toml = {"springBoot": "3.5.0", "springDependencyManagement": "1.1.6",
            "jackson": "2.15.2", "opentelemetry-api": "1.59.0"}
    out = backend.extract_build_keys(toml_versions=toml, props={}, hardcoded_java="21")
    assert out["springBoot"] == "3.5.0"
    assert out["springDependencyManagement"] == "1.1.6"
    assert out["jackson"] == "2.15.2"
    assert out["otel-api"] == "1.59.0"
    assert out["java"] == "21"


def test_extract_build_keys_from_properties():
    props = {"springBootVersion": "3.1.2", "springDependencyManagementVersion": "1.1.7",
             "jacksonDatatypeVersion": "2.15.2", "opentelemetryInstrumentationVersion": "2.25.0",
             "javaVersion": "17"}
    out = backend.extract_build_keys(toml_versions={}, props=props, hardcoded_java=None)
    assert out["springBoot"] == "3.1.2"
    assert out["springDependencyManagement"] == "1.1.7"
    assert out["jackson"] == "2.15.2"
    assert out["java"] == "17"


# ---- drift ----

def test_detect_drift_flags_divergent_key():
    matrix = {
        "eam": {"springBoot": "3.1.2", "java": "17"},
        "observer": {"springBoot": "3.5.0", "java": "21"},
    }
    drift = backend.detect_drift(matrix)
    keys = {d["key"] for d in drift}
    assert keys == {"springBoot", "java"}
    sb = next(d for d in drift if d["key"] == "springBoot")
    assert sb["values"] == {"eam": "3.1.2", "observer": "3.5.0"}


def test_detect_drift_no_drift_when_aligned():
    matrix = {"a": {"jackson": "2.15.2"}, "b": {"jackson": "2.15.2"}}
    assert backend.detect_drift(matrix) == []


def test_detect_drift_ignores_none_only():
    matrix = {"a": {"gradle": None}, "b": {"gradle": "8.14.4"}}
    drift = backend.detect_drift(matrix)
    assert drift == []


# ---- batch jobs ----

def test_parse_run_mode_oneshot():
    text = "spring:\n  batch:\n    run:\n      mode: commandLineRunner\n"
    assert backend.parse_run_mode(text) == "oneshot"


def test_parse_run_mode_scheduled():
    text = "    run:\n      mode: scheduled\n"
    assert backend.parse_run_mode(text) == "scheduled"


def test_parse_run_mode_default_oneshot_when_absent():
    assert backend.parse_run_mode("spring:\n  batch:\n") == "oneshot"


def test_classify_job_mode():
    assert backend.classify_job_mode("scheduled") == "scheduled"
    assert backend.classify_job_mode("commandLineRunner") == "oneshot"


def test_parse_scheduled_jobs_yml():
    text = (
        "  batch:\n"
        "    run:\n"
        "      mode: commandLineRunner\n"
        "    scheduled-jobs:\n"
        "      job1:\n"
        "        enabled: true\n"
        "        name: attendanceTimeSetSummaryBatchJob\n"
        '        cron: "0 */2 * * * ?"\n'
        "      job2:\n"
        "        enabled: true\n"
        "        name: forceQuitEndBatchJob\n"
        '        cron: "0 */1 * * * ?"\n'
        "  data:\n"
        "    redis:\n"
    )
    jobs = backend.parse_scheduled_jobs_yml(text)
    assert len(jobs) == 2
    assert jobs[0] == {"key": "job1", "name": "attendanceTimeSetSummaryBatchJob", "cron": "0 */2 * * * ?"}
    assert jobs[1]["name"] == "forceQuitEndBatchJob"


def test_parse_scheduled_jobs_yml_job_key_trailing_comment():
    text = (
        "    scheduled-jobs:\n"
        "      job1: # 출입시간세트 - 포트: 20000\n"
        "        enabled: true\n"
        "        name: attendanceTimeSetSummaryBatchJob\n"
        '        cron: "0 */2 * * * ?" # 매 2분마다 실행\n'
    )
    jobs = backend.parse_scheduled_jobs_yml(text)
    assert jobs == [{"key": "job1", "name": "attendanceTimeSetSummaryBatchJob", "cron": "0 */2 * * * ?"}]


def test_parse_scheduled_jobs_yml_empty():
    assert backend.parse_scheduled_jobs_yml("spring:\n  batch:\n") == []


# ---- dockerfile ----

def test_parse_dockerfile_single_stage_root():
    text = (
        "FROM dev-mis-registry.smiledev.net/library/eclipse-temurin:17-jre-alpine\n"
        "WORKDIR /app\nEXPOSE 8080\n"
    )
    p = backend.parse_dockerfile(text)
    assert p["base_image"] == "dev-mis-registry.smiledev.net/library/eclipse-temurin:17-jre-alpine"
    assert p["registry"] == "dev-mis-registry.smiledev.net"
    assert p["user"] is None
    assert p["multistage"] is False


def test_parse_dockerfile_nonroot_arg_registry():
    text = (
        "ARG REGISTRY=mis-registry.smilegate.net\n"
        "FROM ${REGISTRY}/library/eclipse-temurin:21-jre-alpine\n"
        "USER 1000\n"
    )
    p = backend.parse_dockerfile(text)
    assert p["registry"] == "mis-registry.smilegate.net"
    assert p["user"] == "1000"
    assert p["multistage"] is False


def test_parse_dockerfile_multistage():
    text = "FROM gradle:8 AS build\nRUN gradle build\nFROM eclipse-temurin:17-jre\nUSER app\n"
    p = backend.parse_dockerfile(text)
    assert p["multistage"] is True
    assert p["base_image"] == "eclipse-temurin:17-jre"


def test_audit_nonroot():
    assert backend.audit_nonroot({"user": "1000"}) is True
    assert backend.audit_nonroot({"user": "root"}) is False
    assert backend.audit_nonroot({"user": None}) is False


def test_env_from_dockerfile_path():
    assert backend.env_from_dockerfile_path("eam/ep-be-eam-api/deploy/dev/Dockerfile") == "dev"
    assert backend.env_from_dockerfile_path("a/deploy/kubernetes/Dockerfile") == "kubernetes"
    assert backend.env_from_dockerfile_path("a/container/stg/Dockerfile") == "stg"
    assert backend.env_from_dockerfile_path("a/deploy/k8s/Dockerfile") == "k8s"
    assert backend.env_from_dockerfile_path("tlm/deploy/dev/tlm/Dockerfile") == "dev"
