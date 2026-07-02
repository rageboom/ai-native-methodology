---
description: 백엔드(TLM/EAM/GEA/OBSERVER) 코드 작성 시 적용하는 객체지향 원칙, 디자인 패턴, DDD 전술/전략 설계. 정립된 이론과 저자 근거 기반.
paths:
  - "tlm/ep-be-tlm/**/*.java"
  - "eam/ep-be-eam/**/*.java"
  - "gea/**/*.java"
  - "sgh-mis-observer/**/*.kt"
  - "sgh-mis-observer/**/*.kts"
---

# Backend OO / Design Patterns / DDD

레이어링과 의존성 방향은 `architecture.md`(Clean Architecture)를 따른다. 이 파일은 그 위에서 클래스를 어떻게 설계하고 책임을 어떻게 나눌지를 다룬다. 아래 원칙은 출처가 분명한 정립된 이론이다. 코드를 새로 쓰거나 리팩토링할 때 근거로 인용한다.

## 객체지향 원칙

SOLID. 다섯 원칙은 Robert C. Martin 이 2000년 논문 "Design Principles and Design Patterns"에 정리했고, SOLID 라는 약어는 Michael Feathers 가 2004년경 붙였다.

- SRP, 한 클래스는 변경 이유가 하나여야 한다. 액터가 다르면 분리한다.
- OCP, 확장에 열리고 수정에 닫힌다. 원류는 Bertrand Meyer 의 1988년 "Object-Oriented Software Construction"(상속 기반)이고, Martin 이 1996년 추상 인터페이스와 다형성 치환 기반으로 재정의했다. 분기문 증식 대신 다형성으로 푼다.
- LSP, 하위 타입은 상위 타입 계약을 깨지 않는다. Barbara Liskov 의 1987년 OOPSLA keynote "Data abstraction and hierarchy"에서 시작했고, Liskov 와 Jeannette Wing 이 1994년 "A behavioral notion of subtyping"으로 형식화했다. 상속으로 기능을 줄이거나 예외를 더 던지면 위반이다.
- ISP, 쓰지 않는 메서드에 의존하지 않도록 인터페이스를 잘게 나눈다.
- DIP, 구체가 아니라 추상에 의존한다. 도메인이 인프라 구현을 import 하지 않는다.

책임 할당은 GRASP 로 판단한다. Craig Larman 이 1997년 "Applying UML and Patterns"에서 정리한 9원칙이다. Information Expert(데이터를 가진 객체에 행위를 둔다), Creator, Controller, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations.

결합도와 응집도는 Larry Constantine 과 Edward Yourdon 의 "Structured Design" 기준으로 본다. 응집은 높이고 결합은 낮춘다. 결합의 종류는 Meilir Page-Jones 가 제시한 Connascence 메트릭으로 더 세분할 수 있다. 이름, 타입, 위치, 알고리즘 중 무엇으로 묶여 있는지 구분한다.

객체 간 대화는 Tell, Don't Ask 와 최소 지식 원칙을 따른다. 최소 지식 원칙(Law of Demeter)은 1987년 Northeastern University 에서 Ian Holland 가 제안하고 Karl Lieberherr 가 정립했다. getter 로 내부 상태를 꺼내 바깥에서 판단하지 말고, 판단을 데이터를 가진 객체에 넘긴다. 캡슐화가 깨지면 빈약한 도메인 모델이 된다. Martin Fowler 가 2003년 글에서 안티패턴으로 규정했고(Eric Evans 와 함께), 도메인 모델 비용은 다 치르면서 이득은 못 얻는 상태라고 설명한다.

## 디자인 패턴

GoF("Design Patterns", Gamma, Helm, Johnson, Vlissides)는 문제 맥락이 맞을 때만 쓴다. 패턴 이름을 먼저 정하고 코드를 끼워 맞추지 않는다. 자주 쓰는 것은 Strategy(분기 제거), Factory Method, Template Method, Adapter, Decorator, Observer(도메인 이벤트), State.

엔터프라이즈 계층 패턴은 Fowler("Patterns of Enterprise Application Architecture")를 따른다. Repository, Service Layer, DTO, Unit of Work, 그리고 로직 배치 선택지인 Transaction Script와 Domain Model. 단순 CRUD는 Transaction Script가 적절할 수 있고, 규칙이 두꺼운 도메인은 Domain Model로 간다. 무조건 한쪽을 강요하지 않는다.

리팩토링은 Fowler("Refactoring")의 code smell과 카탈로그를 근거로 한다. God Class, Feature Envy, Long Method, Primitive Obsession, Shotgun Surgery, Data Clumps를 신호로 본다.

## DDD

전략 설계는 Eric Evans 의 2003년 "Domain-Driven Design: Tackling Complexity in the Heart of Software"를 따른다.

- Ubiquitous Language, 코드의 이름이 업무 용어와 일치해야 한다. 번역 계층을 두지 않는다.
- Bounded Context, 모델의 경계를 명시한다. 네 레포(TLM, EAM, GEA, OBSERVER)는 각각 별도 컨텍스트로 본다. core 추출이나 통합 시 Context Map(Shared Kernel, Customer-Supplier, Anti-Corruption Layer)으로 관계를 정한다. 컨텍스트 경계를 넘는 무분별한 공유는 결합을 키운다.

전술 설계는 Evans, 그리고 Vaughn Vernon 의 2013년 "Implementing Domain-Driven Design"을 따른다.

- Entity는 식별자로 동일성을 가진다. Value Object는 불변이고 값으로 비교한다. 가능하면 Value Object를 늘린다.
- Aggregate는 일관성 경계다. Vernon의 규칙을 따른다. 작게 설계한다, 경계 밖은 ID로 참조한다, 경계 밖 변경은 결과적 일관성으로 맞춘다, 한 트랜잭션은 한 Aggregate만 수정한다.
- Repository는 Aggregate 루트 단위로 둔다. Domain Service는 한 엔티티에 속하지 않는 도메인 로직을 담는다. Domain Event로 부수효과를 분리한다.
- 읽기와 쓰기 모델 분리가 필요하면 CQRS 를 고려한다. Greg Young 이 명명했고, Bertrand Meyer 의 Command Query Separation 어휘를 모델 분리 수준으로 확장한 것이다. 조회 조건이 복잡하면 Specification 패턴을 쓴다.

## 적용 시 판단

원칙은 도구이지 목적이 아니다. 과한 추상화는 그 자체로 결합과 복잡도다. 규칙을 어길 때는 왜 어기는지 근거를 남긴다. 설계 결정은 위 저자와 이론을 인용해 설명하고, 추측이면 `[추측]` 라벨을 붙인다.

## 출처

귀속은 1차/표준 출처로 확인했다(2026-06-09).

- SOLID: Robert C. Martin, "Design Principles and Design Patterns"(2000). 약어는 Michael Feathers(2004).
- OCP: Bertrand Meyer, "Object-Oriented Software Construction"(1988). Martin 의 1996년 재정의.
- LSP: Barbara Liskov, OOPSLA keynote "Data abstraction and hierarchy"(1987). Liskov, Wing, "A behavioral notion of subtyping"(1994).
- GRASP: Craig Larman, "Applying UML and Patterns"(1997).
- 응집/결합: Constantine, Yourdon, "Structured Design". Connascence: Meilir Page-Jones.
- Law of Demeter: Ian Holland, Karl Lieberherr, Northeastern University(1987).
- 디자인 패턴: GoF(Gamma, Helm, Johnson, Vlissides), "Design Patterns"(1994).
- 엔터프라이즈 패턴/리팩토링/Anemic Domain Model: Martin Fowler, "Patterns of Enterprise Application Architecture", "Refactoring", martinfowler.com/bliki/AnemicDomainModel.html(2003).
- DDD: Eric Evans, "Domain-Driven Design"(2003). Vaughn Vernon, "Implementing Domain-Driven Design"(2013).
- CQRS: Greg Young(명명), Bertrand Meyer 의 CQS 확장.
