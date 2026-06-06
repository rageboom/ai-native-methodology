"""AI-Native 방법론 chain-harness dogfood (PoC #19) — 대출 상환 슬라이스 테스트.

각 테스트는 acceptance-criteria.json 의 AC 와 1:1 대응한다 (TC-id 주석).
기대 수치는 numpy_financial v1.0.0 _financial.py 의 docstring 예시 및 실측으로 확정.
DB/네트워크/Docker 불요 — 순수 수치 비교 (no-simulation / Tier 1 실 pytest).
"""

import numpy as np
import pytest

import numpy_financial as npf


# TC-PMT-001  <-  AC-PMT-001 / BHV-PMT-001 / BR-PMT-EQUATION-001
def test_pmt_tvm_equation():
    # 15년 만기 7.5% 연리 $200,000 대출의 월 상환금.
    result = npf.pmt(0.075 / 12, 12 * 15, 200000)
    assert result == pytest.approx(-1854.0247200054619, rel=1e-7)


# TC-PMT-002  <-  AC-PMT-002 / BHV-PMT-002 / BR-PMT-ZERORATE-001
def test_pmt_zero_rate_linear_split():
    # rate=0 이면 -(fv+pv)/nper = -(0+1200)/12 = -100.
    result = npf.pmt(0, 12, 1200)
    assert result == pytest.approx(-100.0)


# TC-IPMT-001  <-  AC-IPMT-001 / BHV-IPMT-001 / BR-IPMT-BALANCE-001
def test_ipmt_first_period_interest():
    # 1년 $2500 대출(8.24% 연리 월복리)의 첫 기간 이자 상환분.
    result = npf.ipmt(0.0824 / 12, 1, 12, 2500)
    assert result == pytest.approx(-17.17, abs=0.01)


# TC-IPMT-002  <-  AC-IPMT-002 / BHV-IPMT-002 / BR-IPMT-BEGINFIRST-001
def test_ipmt_begin_first_period_zero():
    # 기초 납입(when='begin')의 첫 기간 이자 상환분은 0.
    result = npf.ipmt(0.0824 / 12, 1, 12, 2500, when='begin')
    assert result == pytest.approx(0.0)


# TC-PPMT-001  <-  AC-PPMT-001 / BHV-PPMT-001 / BR-AMORT-DECOMPOSE-001
def test_ppmt_decomposition_invariant():
    # 모든 기간에서 ipmt + ppmt == pmt (분해 불변식).
    rate, nper, pv = 0.0824 / 12, 12, 2500
    per = np.arange(nper) + 1
    ipmt = npf.ipmt(rate, per, nper, pv)
    ppmt = npf.ppmt(rate, per, nper, pv)
    total = npf.pmt(rate, nper, pv)
    assert np.allclose(ipmt + ppmt, total)
