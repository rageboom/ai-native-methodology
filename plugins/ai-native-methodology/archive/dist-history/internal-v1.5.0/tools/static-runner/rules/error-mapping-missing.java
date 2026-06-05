// Semgrep test fixture for rules/error-mapping-missing.yml.
// 실행: PYTHONUTF8=1 semgrep --test --config error-mapping-missing.yml error-mapping-missing.java
// 본 fixture = AP-API-001 patterns: generic Java exception thrown inside Spring-managed bean.
// PoC #02 ArticleService.favorite() throw IllegalArgumentException 학습 (F-070+F-079+F-085 묶음).

// ===== positive cases (ruleid 매칭 의무 / @Service / @RestController / @Component) =====

@Service
class ArticleService {
    public void favorite() {
        // ruleid: internal.be.api.error-mapping-generic-exception-in-service
        throw new IllegalArgumentException("already favorited");
    }
}

@Service("namedService")
class UserService {
    public void update() {
        // ruleid: internal.be.api.error-mapping-generic-exception-in-service
        throw new IllegalStateException("invalid state");
    }
}

@RestController
class ArticleController {
    public void create() {
        // ruleid: internal.be.api.error-mapping-generic-exception-in-service
        throw new RuntimeException("generic error");
    }
}

@Controller
class ViewController {
    public void render() {
        // ruleid: internal.be.api.error-mapping-generic-exception-in-service
        throw new IllegalArgumentException("msg", new RuntimeException("cause"));
    }
}

@Component
class HelperBean {
    public void process() {
        // ruleid: internal.be.api.error-mapping-generic-exception-in-service
        throw new IllegalArgumentException("not allowed");
    }
}

// ===== negative cases (ok 매칭 의무) =====

// (1) 도메인 specific exception 사용 — Spring bean 안에서도 OK
@Service
class ProductService {
    public void buy() {
        // ok: internal.be.api.error-mapping-generic-exception-in-service
        throw new ConflictException("already purchased");
    }
}

@Service
class CustomerService {
    public void notFound() {
        // ok: internal.be.api.error-mapping-generic-exception-in-service
        throw new NotFoundException("customer not found");
    }
}

@RestController
class PaymentController {
    public void unauth() {
        // ok: internal.be.api.error-mapping-generic-exception-in-service
        throw new UnauthorizedException("not allowed");
    }
}

// (2) generic exception 이지만 Spring bean 외부 — utility / value object OK
class StringUtils {
    public static void validate(String s) {
        // ok: internal.be.api.error-mapping-generic-exception-in-service
        if (s == null) throw new IllegalArgumentException("string is null");
    }
}

class Money {
    public Money add(Money other) {
        // ok: internal.be.api.error-mapping-generic-exception-in-service
        if (other == null) throw new IllegalArgumentException("null");
        return this;
    }
}
