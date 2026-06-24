# 슬라이스 테스트 — Controller (@WebMvcTest)

웹 레이어만 로드. service 는 mock. 직렬화·검증·상태코드·예외 매핑을 본다.

```java
package {{패키지}};

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({{대상Controller}}.class)
class {{대상Controller}}Test {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockBean {{서비스}} {{서비스변수}};

    @Test
    @DisplayName("GET {{경로}} - 200")
    void get_ok() throws Exception {
        given({{서비스변수}}.{{메서드}}(any())).willReturn({{stub}});

        mvc.perform(get("{{경로}}").param("{{param}}", "{{값}}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.{{필드}}").value({{기대}}));
    }

    @Test
    @DisplayName("POST {{경로}} - 검증 실패 시 400")
    void post_validation_fail() throws Exception {
        var badBody = om.writeValueAsString({{잘못된요청}});

        mvc.perform(post("{{경로}}").contentType(MediaType.APPLICATION_JSON).content(badBody))
            .andExpect(status().isBadRequest());
    }
}
```

체크: 보안 필터가 슬라이스에 끼면 `@WebMvcTest(... )` + `@MockBean` 으로 인증 의존을 mock 하거나 `@AutoConfigureMockMvc(addFilters=false)`. 응답 래퍼(ResponseData) 구조에 맞춰 jsonPath 작성.
