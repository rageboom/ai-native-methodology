"""공용 HTTP 클라이언트 — auth/retry/timeout/에러 표준."""
from __future__ import annotations

import os
import ssl
from typing import Any

import certifi
import httpx

DEFAULT_TIMEOUT = 20.0


class HttpError(RuntimeError):
    def __init__(self, status: int, body: str):
        # body 는 자격증명/응답 내용 노출 위험이 있어 메시지에 넣지 않고 속성으로만 보관
        self.status = status
        self.body = body
        super().__init__(f"HTTP {status}")


def _verify() -> ssl.SSLContext | bool:
    # 사내 사설 CA 로 SSL 검증 실패 시 ILLUMINATI_INSECURE=1 로 우회
    if os.environ.get("ILLUMINATI_INSECURE") == "1":
        return False
    # 사내 wiki(Confluence) 는 구형 TLS renegotiation 요구 → 허용(인증서 검증은 유지)
    ctx = ssl.create_default_context(cafile=certifi.where())
    ctx.options |= getattr(ssl, "OP_LEGACY_SERVER_CONNECT", 0x4)
    return ctx


_client: httpx.Client | None = None


def client() -> httpx.Client:
    global _client
    if _client is None:
        if os.environ.get("ILLUMINATI_INSECURE") == "1":
            import sys
            print("[illuminati-mcp] WARNING: ILLUMINATI_INSECURE=1 — TLS 검증 비활성화됨", file=sys.stderr)
        # verify 는 transport 에 줘야 적용됨 — Client(transport=...) 를 명시하면 Client 의 verify 는 무시된다
        _client = httpx.Client(
            transport=httpx.HTTPTransport(retries=2, verify=_verify()),
            timeout=DEFAULT_TIMEOUT,
            follow_redirects=True,
        )
    return _client


def request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    params: dict[str, Any] | None = None,
    json_body: Any = None,
    data: Any = None,
    auth: tuple[str, str] | None = None,
) -> httpx.Response:
    r = client().request(method, url, headers=headers, params=params, json=json_body, data=data, auth=auth)
    if r.status_code >= 400:
        raise HttpError(r.status_code, r.text)
    return r


def get_json(url: str, **kw: Any) -> Any:
    return request("GET", url, **kw).json()


def post_json(url: str, **kw: Any) -> Any:
    r = request("POST", url, **kw)
    return r.json() if r.content else {}
