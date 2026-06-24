# 단위 테스트 — Kotlin (OBSERVER, JUnit5 + MockK + Kotest assertion)

```kotlin
package {{패키지}}

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.assertions.throwables.shouldThrow
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

class {{대상}}Test {

    private val {{의존}} = mockk<{{의존타입}}>()
    private val sut = {{대상}}({{의존}})

    @Test
    @DisplayName("{{메서드}} 정상 {{기대}}")
    fun `{{메서드}} success`() {
        // given
        every { {{의존}}.{{호출}}(any()) } returns {{stub}}

        // when
        val result = sut.{{메서드}}({{입력}})

        // then
        result shouldNotBe null
        result.{{필드}} shouldBe {{기대값}}
        verify { {{의존}}.{{호출}}(any()) }
    }

    @Test
    @DisplayName("{{메서드}} {{예외조건}} 예외")
    fun `{{메서드}} throws`() {
        // given
        every { {{의존}}.{{호출}}(any()) } throws {{예외}}()

        // when & then
        shouldThrow<{{기대예외}}> { sut.{{메서드}}({{입력}}) }
    }
}
```

체크: ES 쿼리 빌더처럼 대량 결과를 다루는 로직은 경계(0건, 10000건 초과 scroll 분기)를 반드시 케이스로. 코루틴이면 `runTest` + `TestDispatcher`. `!!` 의존 코드는 null 입력 케이스로 NPE 경로 고정.
