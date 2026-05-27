import json

elements = []
seed_counter = [5000]
def s():
    seed_counter[0] += 7
    return seed_counter[0]

COMMON_RECT = {
    "angle": 0, "fillStyle": "solid", "strokeWidth": 2,
    "strokeStyle": "solid", "roughness": 1, "opacity": 100,
    "groupIds": [], "frameId": None, "roundness": {"type": 3},
    "isDeleted": False, "updated": 0, "link": None, "locked": False,
}
COMMON_NO_ROUND = {k: v for k, v in COMMON_RECT.items() if k != "roundness"}

def box(id_, x, y, w, h, bg, stroke, text_id, stroke_style="solid"):
    r = {"id": id_, "type": "rectangle", "x": x, "y": y,
         "width": w, "height": h, "strokeColor": stroke,
         "backgroundColor": bg, "seed": s(), "version": 1,
         "versionNonce": s(),
         "boundElements": [{"id": text_id, "type": "text"}],
         **COMMON_RECT}
    if stroke_style != "solid":
        r["strokeStyle"] = stroke_style
    return r

def txt(id_, container_id, x, y, w, h, text, color="#000000", font_size=15):
    return {"id": id_, "type": "text", "x": x, "y": y,
            "width": w, "height": h, "strokeColor": color,
            "backgroundColor": "transparent", "seed": s(), "version": 1,
            "versionNonce": s(), "text": text, "originalText": text,
            "fontSize": font_size, "fontFamily": 2,
            "textAlign": "center", "verticalAlign": "middle",
            "baseline": int(font_size * 1.15), "lineHeight": 1.25,
            "containerId": container_id, "boundElements": None,
            **COMMON_NO_ROUND}

def elbow_arrow(id_, sx, sy, pts, sid=None, eid=None,
                stroke="#334155", stroke_style="solid", end_arrow="arrow"):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    a = {"id": id_, "type": "arrow", "x": sx, "y": sy,
         "width": max(1, max(xs) - min(xs)),
         "height": max(1, max(ys) - min(ys)),
         "strokeColor": stroke, "backgroundColor": "transparent",
         "seed": s(), "version": 1, "versionNonce": s(),
         "boundElements": [], "points": pts, "lastCommittedPoint": None,
         "startBinding": {"elementId": sid, "focus": 0, "gap": 1} if sid else None,
         "endBinding": {"elementId": eid, "focus": 0, "gap": 1} if eid else None,
         "startArrowhead": None, "endArrowhead": end_arrow, "elbowed": False,
         **COMMON_NO_ROUND}
    if stroke_style != "solid":
        a["strokeStyle"] = stroke_style
    return a

def free_text(id_, x, y, w, h, text, color="#475569", font_size=14):
    return {"id": id_, "type": "text", "x": x, "y": y,
            "width": w, "height": h, "strokeColor": color,
            "backgroundColor": "transparent", "seed": s(), "version": 1,
            "versionNonce": s(), "text": text, "originalText": text,
            "fontSize": font_size, "fontFamily": 2,
            "textAlign": "center", "verticalAlign": "middle",
            "baseline": int(font_size * 1.15), "lineHeight": 1.25,
            "containerId": None, "boundElements": None,
            **COMMON_NO_ROUND}

COLOR = {
    "ini":     ("#fef3c7", "#92400e"),
    "epic":    ("#dbeafe", "#1e40af"),
    "epicDbt": ("#fde2e4", "#991b1b"),
    "story":   ("#dcfce7", "#166534"),
    "stClsd":  ("#e5e7eb", "#6b7280"),
    "bug":     ("#fee2e2", "#dc2626"),
    "bugClsd": ("#e5e7eb", "#6b7280"),
    "task":    ("#fed7aa", "#9a3412"),
    "subtask": ("#f3e8ff", "#6b21a8"),
    "rule":    ("#ffffff", "#1e293b"),
    "qbox":    ("#e0e7ff", "#3730a3"),
    "note":    ("#fffbeb", "#d97706"),   # 사내 link type 경고 메모
}

boxes = [
    ("ini",  40, 425, 240, 80, "ini",     "Initiative: 시스템\n(예: 고객포털)", 15, "#000000", "solid"),

    ("e1",  420, 150, 260, 70, "epic",    "Epic: 회원가입 화면\n[open 유지]", 15, "#000000", "solid"),
    ("e2",  420, 430, 260, 70, "epic",    "Epic: 주문 상세 화면\n[open 유지]", 15, "#000000", "solid"),
    ("e3",  420, 710, 260, 70, "epicDbt", "Epic: Tech Debt / Maintenance\n[open 유지]", 14, "#000000", "solid"),

    ("s1",  760,  65, 280, 55, "stClsd",  "Story 123: SNS 로그인 추가  [closed]", 13, "#6b7280", "solid"),
    ("s2",  760, 145, 280, 55, "story",   "Story 456: Apple 로그인 추가  [open]", 13, "#000000", "solid"),
    ("b1",  760, 225, 280, 55, "bug",     "Bug 789: SNS 로그인 콜백 실패  [open]", 13, "#000000", "solid"),

    ("s3",  760, 385, 280, 55, "story",   "Story 901: 결제 옵션 추가  [open]", 13, "#000000", "solid"),
    ("b2",  760, 465, 280, 55, "bugClsd", "Bug 902: 주문 합계 오류  [closed]", 13, "#6b7280", "solid"),

    ("t1",  760, 625, 280, 55, "task",    "Task: Spring Boot 3.4 업그레이드", 13, "#000000", "solid"),
    ("t2",  760, 705, 280, 55, "task",    "Task: 로깅 모듈 리팩토링", 13, "#000000", "solid"),
    ("t3",  760, 785, 280, 55, "task",    "Task: CI 파이프라인 개선", 13, "#000000", "solid"),

    ("st1a", 1100,  50, 240, 45, "subtask", "Sub-task: BE API 구현", 12, "#000000", "solid"),
    ("st1b", 1100, 105, 240, 45, "subtask", "Sub-task: FE 컴포넌트 구현", 12, "#000000", "solid"),
    ("st2a", 1100, 160, 240, 45, "subtask", "Sub-task: Apple SDK 연동", 12, "#000000", "solid"),
    ("bst1", 1100, 235, 240, 45, "subtask", "Sub-task: 콜백 URL 수정", 12, "#000000", "solid"),
    ("st3a", 1100, 395, 240, 45, "subtask", "Sub-task: 결제 BE 연동", 12, "#000000", "solid"),
    ("bst2", 1100, 475, 240, 45, "subtask", "Sub-task: 합계 로직 수정", 12, "#000000", "solid"),
    ("tst1", 1100, 635, 240, 45, "subtask", "Sub-task: 의존성 충돌 해결", 12, "#000000", "solid"),

    # Rule boxes (bottom) - r3 갱신 + 높이 확장
    ("r1",  40, 880, 640, 55, "rule", "분기 규칙:  사용자 가치 받음 = Story  /  내부 작업 = Task", 13, "#1e293b", "dashed"),
    ("r2", 700, 880, 640, 55, "rule", "Story vs Bug:  신기능/개선 = Story  /  원래 동작 깨짐 = Bug", 13, "#1e293b", "dashed"),
    ("r3",  40, 945, 640, 75, "rule",
        "변경 규칙 (닫힌 영역은 재오픈 안함):\n결함 -> 신규 Bug + Defect(created by)  ·  개선 -> 신규 Story + Relates", 12, "#1e293b", "dashed"),
    ("r4", 700, 945, 640, 75, "rule",
        "Epic 규칙:  Epic = 화면 단위 또는 Tech Debt 모음\nEpic 은 닫지 않음 (항상 open)", 12, "#1e293b", "dashed"),

    # ===== Decision tree section =====
    ("dt-start", 1600,  60, 200, 50, "ini",   "[요청] 화면 문구 수정", 14, "#000000", "solid"),
    ("dt-q1",    1560, 140, 280, 70, "qbox",  "Q1: 원래 의도대로\n표시되고 있나?", 14, "#000000", "solid"),
    ("dt-q2",    1700, 270, 280, 70, "qbox",  "Q2: 사용자가 보는\n변화인가?", 14, "#000000", "solid"),
    ("dt-rbug",  1420, 270, 240, 60, "bug",   "-> Bug 등록", 15, "#000000", "solid"),
    ("dt-rstory",1560, 400, 240, 60, "story", "-> Story 등록", 15, "#000000", "solid"),
    ("dt-rtask", 1820, 400, 240, 60, "task",  "-> Task 등록", 15, "#000000", "solid"),
    ("dt-change",1420, 495, 640, 85, "rule",
        "변경 규칙 (닫힌 Story/Bug 영역):\n결함 -> 신규 Bug + Defect(created by)  ·  개선 -> 신규 Story + Relates\n단, 미배포(브랜치 개발 중)면 원본 reopen 허용",
        12, "#1e293b", "dashed"),
    ("dt-note", 1420, 595, 640, 55, "note",
        "사내 Jira 사실:  'is caused by' 미설정  ->  'Defect'(created by/created) 또는 'Relates' 로 대체",
        12, "#92400e", "dashed"),
]

for (bid, x, y, w, h, kind, text, fs, tc, ss) in boxes:
    bg, stroke = COLOR[kind]
    tid = bid + "-t"
    elements.append(box(bid, x, y, w, h, bg, stroke, tid, ss))
    elements.append(txt(tid, bid, x, y, w, h, text, color=tc, font_size=fs))

# ===== Main tree arrows =====
def ini_to_epic(ey): return [[0, 0], [70, 0], [70, ey-465], [140, ey-465]]
def epic_to_child(py, cy): return [[0, 0], [40, 0], [40, cy-py], [80, cy-py]]
def to_sub(py, cy): return [[0, 0], [30, 0], [30, cy-py], [60, cy-py]]

main_arrows = [
    ("a-ini-e1", 280, 465, ini_to_epic(185), "ini", "e1"),
    ("a-ini-e2", 280, 465, ini_to_epic(465), "ini", "e2"),
    ("a-ini-e3", 280, 465, ini_to_epic(745), "ini", "e3"),
    ("a-e1-s1", 680, 185, epic_to_child(185,  92.5), "e1", "s1"),
    ("a-e1-s2", 680, 185, epic_to_child(185, 172.5), "e1", "s2"),
    ("a-e1-b1", 680, 185, epic_to_child(185, 252.5), "e1", "b1"),
    ("a-e2-s3", 680, 465, epic_to_child(465, 412.5), "e2", "s3"),
    ("a-e2-b2", 680, 465, epic_to_child(465, 492.5), "e2", "b2"),
    ("a-e3-t1", 680, 745, epic_to_child(745, 652.5), "e3", "t1"),
    ("a-e3-t2", 680, 745, epic_to_child(745, 732.5), "e3", "t2"),
    ("a-e3-t3", 680, 745, epic_to_child(745, 812.5), "e3", "t3"),
    ("a-s1-st1a", 1040,  92.5, to_sub( 92.5,  72.5), "s1", "st1a"),
    ("a-s1-st1b", 1040,  92.5, to_sub( 92.5, 127.5), "s1", "st1b"),
    ("a-s2-st2a", 1040, 172.5, to_sub(172.5, 182.5), "s2", "st2a"),
    ("a-b1-bst1", 1040, 252.5, to_sub(252.5, 257.5), "b1", "bst1"),
    ("a-s3-st3a", 1040, 412.5, to_sub(412.5, 417.5), "s3", "st3a"),
    ("a-b2-bst2", 1040, 492.5, to_sub(492.5, 497.5), "b2", "bst2"),
    ("a-t1-tst1", 1040, 652.5, to_sub(652.5, 657.5), "t1", "tst1"),
]
for (aid, sx, sy, pts, sid, eid) in main_arrows:
    elements.append(elbow_arrow(aid, sx, sy, pts, sid, eid))

elements.append(elbow_arrow("a-relate", 760, 172.5,
                            [[0, 0], [-30, 0], [-30, -80], [0, -80]],
                            "s2", "s1", stroke="#6b7280", stroke_style="dashed"))
elements.append(free_text("lbl-relate", 600, 110, 130, 22,
                          "relates to (원본)", color="#6b7280", font_size=12))

# ===== Decision tree arrows =====
elements.append(elbow_arrow("a-dt-1", 1700, 110, [[0,0],[0,30]], "dt-start", "dt-q1"))
elements.append(elbow_arrow("a-dt-no1", 1700, 210,
                            [[0,0],[0,30],[-40,30],[-40,90]], "dt-q1", "dt-rbug"))
elements.append(elbow_arrow("a-dt-yes1", 1700, 210,
                            [[0,0],[0,30],[140,30],[140,60]], "dt-q1", "dt-q2"))
elements.append(elbow_arrow("a-dt-yes2", 1840, 340,
                            [[0,0],[0,30],[-160,30],[-160,60]], "dt-q2", "dt-rstory"))
elements.append(elbow_arrow("a-dt-no2", 1840, 340,
                            [[0,0],[0,30],[100,30],[100,60]], "dt-q2", "dt-rtask"))

elements.append(free_text("lbl-no1",  1605, 245, 40, 18, "NO",  color="#991b1b", font_size=13))
elements.append(free_text("lbl-yes1", 1750, 222, 40, 18, "YES", color="#166534", font_size=13))
elements.append(free_text("lbl-yes2", 1735, 352, 40, 18, "YES", color="#166534", font_size=13))
elements.append(free_text("lbl-no2",  1870, 352, 40, 18, "NO",  color="#991b1b", font_size=13))

elements.append(free_text("dt-header", 1420, 15, 640, 30,
                          "PM 분기 결정 흐름  (요청 들어왔을 때)",
                          color="#0f172a", font_size=18))

# divider (연장)
elements.append(elbow_arrow("dt-divider", 1390, 50,
                            [[0,0],[0,600]], None, None,
                            stroke="#cbd5e1", stroke_style="dashed", end_arrow=None))

elements.append(free_text("title", 460, 0, 440, 40,
                          "사내 Jira 운영 표준 — 트리 (LR)",
                          color="#0f172a", font_size=24))

elements.append(free_text("legend", 40, 1035, 1920, 22,
                          "노랑=Initiative · 파랑=화면 Epic · 분홍=Tech Debt Epic · 초록=Story(open) · 빨강=Bug(open) · 회색=Closed · 오렌지=Task · 보라=Sub-task · 인디고=결정 노드",
                          color="#475569", font_size=13))

doc = {
    "type": "excalidraw", "version": 2, "source": "https://excalidraw.com",
    "elements": elements,
    "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"},
    "files": {}
}
out = "/Users/sangcl/Documents/Development/Study/ai-native-methodology/.claude/plans/jira-workflow-diagram.excalidraw"
with open(out, "w", encoding="utf-8") as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
print(f"total: {len(elements)} elements")
print(f"saved: {out}")
