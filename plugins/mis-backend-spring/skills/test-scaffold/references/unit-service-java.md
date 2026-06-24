# 단위 테스트 — Service (Java, JUnit5 + Mockito + AssertJ)

외부 의존을 mock 으로 격리하고 분기·경계·예외 경로를 덮는다.

```java
package {{패키지}};

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class {{대상}}Test {

    @Mock
    private {{의존타입}} {{의존}};

    @InjectMocks
    private {{대상}} sut;

    @Test
    @DisplayName("{{메서드}}_정상_{{기대}}")
    void {{메서드}}_success() {
        // given
        given({{의존}}.{{호출}}(any())).willReturn({{stub}});

        // when
        var result = sut.{{메서드}}({{입력}});

        // then
        assertThat(result).isNotNull();
        assertThat(result.{{필드}}()).isEqualTo({{기대값}});
        then({{의존}}).should().{{호출}}(any());
    }

    @Test
    @DisplayName("{{메서드}}_{{예외조건}}_예외")
    void {{메서드}}_throws() {
        // given
        given({{의존}}.{{호출}}(any())).willThrow(new {{예외}}());

        // when & then
        assertThatThrownBy(() -> sut.{{메서드}}({{입력}}))
            .isInstanceOf({{기대예외}}.class);
    }

    @Test
    @DisplayName("{{메서드}}_입력이_null이면_검증")
    void {{메서드}}_null() {
        // when & then
        assertThatThrownBy(() -> sut.{{메서드}}(null))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
```

체크: 정상 1개로 끝내지 말 것. 분기마다 케이스를 더한다. 시계 의존은 `Clock` 주입 후 `Clock.fixed(...)`. `@Transactional` 경계는 단위가 아니라 통합에서 검증.
