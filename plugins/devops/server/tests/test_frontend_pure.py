from illuminati_mcp import frontend


# ---- tool 1: MF remote consistency ----

VITE_HOST = """
federation({
  name: 'host',
  remotes: {
    'remote-119': { entry: env.REACT_APP_REMOTE_119_URL },
    'remote-tlm': { entry: env.REACT_APP_REMOTE_TLM_URL },
    'remote-gea': { entry: env.REACT_APP_REMOTE_GEA_URL },
    'remote-hrm': { entry: env.REACT_APP_REMOTE_HRM_URL },
    'remote-eam': { entry: env.REACT_APP_REMOTE_EAM_URL },
    'remote-observer': { entry: env.REACT_APP_REMOTE_OBSERVER_URL },
  },
})
"""

VITE_EXPOSE = """
federation({
  name: 'remote-tlm',
  filename: 'remoteEntry.js',
  exposes: { './App': './src/App' },
  getPublicPath: `return '/remote-tlm/'`,
})
"""


def test_parse_vite_remotes_host():
    d = frontend.parse_vite_remotes(VITE_HOST)
    assert d["remote-119"] == "REACT_APP_REMOTE_119_URL"
    assert d["remote-observer"] == "REACT_APP_REMOTE_OBSERVER_URL"
    assert len(d) == 6


def test_parse_vite_expose():
    e = frontend.parse_vite_expose(VITE_EXPOSE)
    assert e["name"] == "remote-tlm"
    assert e["public_path"] == "/remote-tlm/"


def test_parse_vite_expose_empty():
    assert frontend.parse_vite_expose("nothing here") == {"name": None, "public_path": None}


def test_parse_env_remote_urls():
    text = (
        "REACT_APP_API_BASE_URL=https://x\n"
        "REACT_APP_REMOTE_TLM_URL=/remote-tlm/mf-manifest.json\n"
        "# REACT_APP_REMOTE_GEA_URL=/old\n"
        "REACT_APP_REMOTE_GEA_URL=/remote-gea/mf-manifest.json\n"
    )
    d = frontend.parse_env_remote_urls(text)
    assert d == {
        "tlm": "/remote-tlm/mf-manifest.json",
        "gea": "/remote-gea/mf-manifest.json",
    }


def test_parse_proxy_routes():
    inc = """
location / { proxy_pass http://$upstream_common; }
location /remote-119/ { proxy_pass http://$upstream_119:80; }
location /remote-tlm/ { proxy_pass http://$upstream_tlm:80; }
"""
    locs = frontend.parse_proxy_routes(inc)
    assert "/remote-119/" in locs
    assert "/remote-tlm/" in locs
    assert "/" in locs


def test_parse_groovy_suffix():
    groovy = """
    return [
        'proxy'          : 'proxy',
        'remote-119'     : '119',
        'remote-tlm'     : 'tlm',
        'remote-observer': 'observer'
    ]
    """
    d = frontend.parse_groovy_suffix(groovy)
    assert d["remote-119"] == "119"
    assert d["remote-observer"] == "observer"


def test_cross_check_all_consistent():
    sources = {
        "tlm": {
            "vite_expose": "remote-tlm",
            "env_url": "/remote-tlm/mf-manifest.json",
            "nginx_location": "/remote-tlm/",
            "compose_service": "remote-tlm",
            "groovy_suffix": "tlm",
        }
    }
    assert frontend.cross_check(sources) == []


def test_cross_check_detects_missing_nginx():
    sources = {
        "eam": {
            "vite_expose": "remote-eam",
            "env_url": "/remote-eam/mf-manifest.json",
            "nginx_location": None,
            "compose_service": "remote-eam",
            "groovy_suffix": "eam",
        }
    }
    flags = frontend.cross_check(sources)
    assert any("eam" in f and "nginx" in f for f in flags)


# ---- tool 2: Faro collect audit ----

def test_parse_env_faro_present():
    assert frontend.parse_env_faro("X=1\nREACT_APP_FARO_URL=/collect\n") == "/collect"


def test_parse_env_faro_absent():
    assert frontend.parse_env_faro("X=1\nY=2\n") is None


def test_parse_env_faro_ignores_comment():
    assert frontend.parse_env_faro("# REACT_APP_FARO_URL=/collect\n") is None


def test_parse_nginx_collect():
    conf = """
location = /collect {
    proxy_pass http://10.125.111.62:12347/collect;
}
"""
    assert frontend.parse_nginx_collect(conf) == "http://10.125.111.62:12347/collect"


def test_parse_nginx_collect_absent():
    assert frontend.parse_nginx_collect("location / { try_files $uri; }") is None


def test_audit_faro_match():
    env_map = {("tlm", "dev"): "/collect"}
    nginx_map = {("tlm", "dev"): "http://10.125.111.62:12347/collect"}
    flags = frontend.audit_faro(env_map, nginx_map)
    assert flags == []


def test_audit_faro_stg_missing_is_soft_label():
    env_map = {("tlm", "stg"): None}
    nginx_map = {("tlm", "stg"): None}
    flags = frontend.audit_faro(env_map, nginx_map)
    assert len(flags) == 1
    assert flags[0]["severity"] == "info"
    assert "의도된" in flags[0]["note"]


def test_audit_faro_env_set_but_no_proxy():
    env_map = {("tlm", "dev"): "/collect"}
    nginx_map = {("tlm", "dev"): None}
    flags = frontend.audit_faro(env_map, nginx_map)
    assert flags[0]["severity"] == "warn"


# ---- tool 3: deploy env matrix ----

def test_parse_turbo_targets():
    js = """
{
  "pipeline": {
    "ep-fe-tlm#build:dev": {},
    "ep-fe-gea#build:prod": {},
    "build:stg": {},
    "clean": {}
  }
}
"""
    t = frontend.parse_turbo_targets(js)
    assert ("tlm", "dev") in t
    assert ("gea", "prod") in t
    assert ("*", "stg") in t


def test_build_deploy_matrix_flags_missing_dir():
    fs = {
        ("tlm", "dev"): {
            "deploy_dir_exists": True,
            "dockerfile_env_arg": "dev",
            "turbo_target": "ep-fe-tlm#build:dev",
            "env_file_exists": True,
            "nginx_conf_path": "deploy/dev/tlm/ep-fe-tlm.conf",
        },
        ("tlm", "stg"): {
            "deploy_dir_exists": False,
            "dockerfile_env_arg": None,
            "turbo_target": "ep-fe-tlm#build:stg",
            "env_file_exists": True,
            "nginx_conf_path": None,
        },
    }
    flags = frontend.flag_deploy_matrix(fs)
    assert any("stg" in f and "deploy" in f for f in flags)
    assert not any("dev" in f and "deploy" in f for f in flags)


# ---- tool 4: nginx perf audit ----

FO_HTTP = """
worker_processes 1;
http {
    gzip on;
    gzip_static on;
    gzip_comp_level 1;
}
"""

FO_SERVER = """
location = /health { return 200 'ok'; }
location ~* \\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable" always;
}
"""

BO_NGINX = """
worker_processes auto;
http {
    include /etc/nginx/conf.d/*.conf;
}
"""

BO_REMOTE = """
location ~* (remoteEntry\\.js|mf-manifest\\.json)$ {
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
}
location ~* \\.(js|css)$ {
    add_header Cache-Control "public, immutable";
}
"""


def test_parse_nginx_conf_fo():
    p = frontend.parse_nginx_conf(FO_HTTP + FO_SERVER)
    assert p["worker_processes"] == "1"
    assert p["gzip_static"] is True
    assert p["gzip_comp_level"] == "1"
    assert p["immutable_cache"] is True
    assert p["health"] is True


def test_parse_nginx_conf_bo():
    p = frontend.parse_nginx_conf(BO_NGINX + BO_REMOTE)
    assert p["worker_processes"] == "auto"
    assert p["remoteEntry_nostore"] is True
    assert p["health"] is False


def test_audit_nginx_flags_worker_auto():
    p = frontend.parse_nginx_conf(BO_NGINX + BO_REMOTE)
    flags = frontend.audit_nginx(p)
    assert any("worker_processes" in f for f in flags)


def test_audit_nginx_no_flags_on_tuned_fo():
    p = frontend.parse_nginx_conf(FO_HTTP + FO_SERVER)
    flags = frontend.audit_nginx(p)
    assert not any("worker_processes" in f for f in flags)
    assert not any("gzip_static" in f for f in flags)


def test_audit_nginx_flags_missing_gzip_static():
    p = frontend.parse_nginx_conf("worker_processes 1;\nhttp { gzip on; }")
    flags = frontend.audit_nginx(p)
    assert any("gzip_static" in f for f in flags)
