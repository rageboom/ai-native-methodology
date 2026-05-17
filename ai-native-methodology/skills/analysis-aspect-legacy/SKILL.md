---
name: analysis-aspect-legacy
description: Use when migration scenario detected (Strangler Pattern triggers — old + new codepath coexistence, deprecated API usage, version-pin technical debt, scheduled deprecation). Generates legacy.json (산출물 13). Stage = analysis, aspect = cross-cutting (BE+FE+DB).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-legacy — Legacy / Migration 분석

Strangler Pattern 적용 가능성 / migration debt 식별.

## 사전 조건

- legacy 코드베이스 분석 중 (대부분의 경우)
- 또는 신/구 codepath coexistence 시그널 검출

## 절차

1. **Strangler Pattern trigger 식별**:
   - 같은 기능을 하는 old + new 모듈 (e.g., `legacy-controller` + `new-controller`)
   - feature flag 기반 분기 (legacy → new 전환 진행 중)
   - deprecated annotation / comment / TODO
   - version-pin (e.g., `lock to lib v1.x` while v3 exists)
2. **migration progress 추정** — old vs new 비율 (LOC / 호출 빈도 / API hit)
3. **위험 식별**:
   - 양쪽 codepath 분기 시 logic drift (rules ↔ schema 불일치)
   - feature flag default 가 production 과 불일치
   - migration 미완료 상태에서 다른 작업 진행 시 부채
4. **AP-LEGACY-XXX 등재** — anti-pattern (`quality` phase 통합)
5. **legacy.json 작성** — `schemas/legacy-spectrum.schema.json` (v1.4 신규):
   ```json
   {
     "strangler_zones": [...],
     "deprecated_apis": [...],
     "version_pins": [...],
     "migration_progress": {...},
     "risks": [...],
     "meta_confidence": {...}
   }
   ```

## 산출물

`<user-project>/.aimd/output/legacy.json`

## 본체 명세

- `methodology-spec/deliverables/13-legacy-spectrum.md` (v1.4)
- `schemas/legacy-spectrum.schema.json`
- ADR-FE-003 (legacy + Strangler Pattern)
