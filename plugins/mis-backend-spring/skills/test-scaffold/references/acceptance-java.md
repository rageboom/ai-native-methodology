# 인수/E2E 테스트 — RestAssured + Testcontainers

전체 컨텍스트 기동 + 실제 DB(컨테이너). 인증·권한·정상/오류 응답을 사용자 관점으로 검증.

```java
package {{패키지}};

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

import io.restassured.RestAssured;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MSSQLServerContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class {{도메인}}AcceptanceTest {

    @Container
    static MSSQLServerContainer<?> mssql = new MSSQLServerContainer<>("mcr.microsoft.com/mssql/server:2022-latest").acceptLicense();

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", mssql::getJdbcUrl);
        r.add("spring.datasource.username", mssql::getUsername);
        r.add("spring.datasource.password", mssql::getPassword);
    }

    @LocalServerPort int port;

    @BeforeEach
    void setup() { RestAssured.port = port; }

    @Test
    @DisplayName("{{시나리오}} - 인증 후 200")
    void scenario_authorized() {
        given()
            .header("Authorization", "Bearer " + {{테스트토큰}})
            .contentType("application/json")
        .when()
            .get("{{경로}}")
        .then()
            .statusCode(200)
            .body("data.{{필드}}", notNullValue());
    }

    @Test
    @DisplayName("{{시나리오}} - 토큰 없으면 401")
    void scenario_unauthorized() {
        when().get("{{경로}}").then().statusCode(401);
    }
}
```

체크: observer 는 MSSQL 대신 `ElasticsearchContainer`. 컨테이너 기동이 느리니 인수 테스트는 별도 sourceSet/태그(`@Tag("acceptance")`)로 분리해 CI 에서 선택 실행. 시드 데이터는 `@Sql` 또는 컨테이너 init script.
