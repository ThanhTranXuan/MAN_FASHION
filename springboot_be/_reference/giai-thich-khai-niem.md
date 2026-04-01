## Giải thích các khái niệm trong dự án

File này dành cho người mới vào dự án, giải thích **tại sao code như hiện tại**, khác gì cách code "truyền thống", và **lợi ích** khi làm như vậy.

---

## 1. DI, `@Autowired`, `final` và `@RequiredArgsConstructor`

### 1.1. Vì sao không cần `@Autowired`?

Trong controller:

```java
@RequiredArgsConstructor
public class UserController {
    private final AuthenticationService authService;
}
```

- **Bình thường (cách cũ)**:
  ```java
  @RestController
  public class UserController {
      @Autowired
      private AuthenticationService authService;
  }
  ```
  - Dùng **field injection** với `@Autowired` trực tiếp trên field.
  - Khó test unit (khó mock dependency).
  - Không thấy rõ dependency nào là bắt buộc cho class.

- **Cách đang dùng trong dự án**:
  - Dùng **constructor injection** + Lombok `@RequiredArgsConstructor`.
  - Spring tự generate constructor nhận tất cả field `final`.
  - Từ Spring 4.3 trở đi, **nếu chỉ có 1 constructor**, Spring tự động inject **không cần `@Autowired`**.

**Lợi ích:**

- Code **clear**: nhìn vào field `final` biết ngay class này cần dependency nào.
- **Dễ test**: tạo instance trong unit test bằng cách new `UserController(mockAuthService)`.
- Tránh lỗi vòng lặp DI (circular dependency) khó debug hơn khi dùng field injection.

### 1.2. `final` trong DI có ý nghĩa gì?

```java
private final AuthenticationService authService;
```

- **`final`** nghĩa là:
  - Biến **phải được gán đúng 1 lần** (ở constructor).
  - Sau khi tạo object, không thể thay đổi reference đó nữa.

**Khác biệt `final` vs không `final`:**

- Không `final`:
  - Có thể vô tình gán lại `authService = ...` ở đâu đó → dễ tạo bug.
  - Dependency của class không thực sự "bất biến".
- Có `final`:
  - Đảm bảo dependency **không bị thay đổi** sau khi inject.
  - Kết hợp với constructor injection thể hiện rõ: _“Muốn dùng class này thì bắt buộc phải có dependency đó”_.

**Tóm lại**: Dùng `final` + constructor injection (tạo bởi `@RequiredArgsConstructor`) là **best practice hiện nay trong Spring**.

---

## 2. Giải thích `SecurityConfig` (Spring Security)

File: `SecurityConfig.java`

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
```

### 2.1. `@Configuration` và `@Bean`

- `@Configuration`: đánh dấu class này là **class cấu hình** cho Spring (thay cho XML config kiểu cũ).
- `@Bean`: đánh dấu method tạo ra 1 **bean** được quản lý bởi Spring Container.
  - `SecurityFilterChain` → mô tả chuỗi filter bảo mật.
  - `PasswordEncoder` → dùng mã hoá mật khẩu (BCrypt).

### 2.2. `SecurityFilterChain filterChain(HttpSecurity http)`

- `HttpSecurity` là object cho phép cấu hình:
  - Bảo vệ URL nào.
  - Cho phép/không cho phép ai truy cập.
  - Bật/tắt CSRF, form login, JWT filter, v.v.

Đoạn:

```java
http
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/auth/**").permitAll()
        .anyRequest().authenticated()
    );
```

- **`csrf().disable()`**:
  - CSRF là cơ chế bảo vệ cho ứng dụng web sử dụng session + cookie.
  - Với REST API (client riêng như React, mobile), thường dùng JWT / token, nên thường **tắt CSRF** để đơn giản.

- **`authorizeHttpRequests`**:
  - `requestMatchers("/api/auth/**").permitAll()`:
    - Mọi request có path bắt đầu với `/api/auth/` được **truy cập tự do** (register, login, v.v.).
  - `anyRequest().authenticated()`:
    - Tất cả request còn lại **phải đăng nhập mới access được**.

### 2.3. `PasswordEncoder passwordEncoder()`

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
}
```

- Dùng **BCrypt** để mã hoá password trước khi lưu database.
- `10` là **strength (rounds)**: càng lớn càng an toàn nhưng tốn CPU hơn.
- Lợi ích:
  - Không lưu password plain-text.
  - BCrypt có cơ chế salt + chậm, chống brute-force tốt hơn hash đơn giản.

---

## 3. `ResponseEntity`, `ApiResponse`, `@RequestBody`, Path (`@RequestMapping`, `@PostMapping`)

### 3.1. `ResponseEntity`

Ví dụ trong `UserController`:

```java
@PostMapping("/register")
public ResponseEntity<String> register(@Valid @RequestBody UserCreateRequest request) {
    boolean success = authService.register(request);

    if (!success) {
        return ResponseEntity.badRequest().body("Email already exists");
    }

    return ResponseEntity.ok("Register success");
}
```

- `ResponseEntity<T>` đại diện cho **toàn bộ HTTP response**:
  - Status code (200, 400, 404, 500…)
  - Header
  - Body (`T`)
- Lợi ích:
  - Chủ động **trả status code phù hợp** (OK, BAD_REQUEST, CONFLICT, v.v.).
  - Dễ mở rộng: thêm header, đổi body,…

### 3.2. `ApiResponse<T>`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    int code = 1000;

    String message;
    T data;
}
```

- Đây là **wrapper chung** cho mọi response JSON:
  - `code`: mã business (khác HTTP status).
  - `message`: message thân thiện cho client.
  - `data`: payload thực sự.
- `@JsonInclude(Include.NON_NULL)`: field nào `null` thì **không xuất ra JSON** → response gọn hơn.
- `@Builder.Default`: nếu dùng builder mà không set `code` thì mặc định là `1000`.

**Lợi ích khi dùng `ApiResponse` thay vì trả data thô:**

- Mọi API có **format thống nhất**:
  ```json
  {
    "code": 1000,
    "message": "Thành công",
    "data": { ... }
  }
  ```
- Dễ xử lý ở FE: chỉ cần check `code` và `data`, không phải đoán structure.

### 3.3. `@RequestBody`

```java
public ResponseEntity<String> register(@Valid @RequestBody UserCreateRequest request)
```

- `@RequestBody` nói với Spring:
  - Lấy **JSON body** từ HTTP request.
  - Convert sang object `UserCreateRequest` (dùng Jackson).
- Kết hợp `@Valid`:
  - Tự động chạy validation dựa trên annotation trong `UserCreateRequest` (ví dụ `@NotBlank`, `@Email`, `@Size`…).
  - Nếu sai → ném `MethodArgumentNotValidException` → được bắt ở `GlobalException`.

### 3.4. Path: `@RequestMapping`, `@PostMapping`

```java
@RestController
@RequestMapping("/api/auth")
public class UserController {

    @PostMapping("/register")
    public ...
}
```

- `@RequestMapping("/api/auth")` ở class:
  - Định nghĩa **prefix chung** cho tất cả endpoint trong controller này.
  - Mọi method bên trong đều bắt đầu bằng `/api/auth`.
- `@PostMapping("/register")`:
  - Định nghĩa endpoint **method POST** với path `/register`.
- Kết hợp lại:
  - Endpoint thực tế: **`POST /api/auth/register`**.

---

## 4. `@Builder`, Entity, và MapStruct `@Mapper` (vì sao dùng interface)

### 4.1. `@Builder` (Lombok)

Ví dụ:

```java
@Builder
public class User { ... }
```

hoặc

```java
ApiResponse.<Void>builder()
    .code(...)
    .message(...)
    .build();
```

- `@Builder` tạo ra **Builder pattern** cho class:
  - Thay vì:
    ```java
    ApiResponse<Void> res = new ApiResponse<>();
    res.setCode(1000);
    res.setMessage("OK");
    ```
  - Ta dùng:
    ```java
    ApiResponse.<Void>builder()
        .code(1000)
        .message("OK")
        .build();
    ```
- Lợi ích:
  - Code **dễ đọc** khi object có nhiều field.
  - Hạn chế constructor nhiều tham số dễ nhầm lẫn thứ tự.
  - Dễ tạo object **immutable** nếu kết hợp với `final` + bỏ setter (trong dự án này entity vẫn có setter do dùng JPA).

### 4.2. Tại sao `UserMapper` là `interface` với `@Mapper`

File: `UserMapper.java`

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")
    UserResponse toResponseDTO(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserCreateRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUserFromDTO(UserUpdateRequest dto, @MappingTarget User user);
}
```

#### MapStruct hoạt động như thế nào?

- `@Mapper(componentModel = "spring")`:
  - Báo cho MapStruct generate 1 **class implementation** của interface này.
  - `componentModel = "spring"` → class generate sẽ được Spring quản lý như 1 bean (`@Component`) → có thể `@Autowired` / constructor inject.

- Ta chỉ **khai báo interface + method mapping**, MapStruct:
  - Generate code Java thật tại compile time.
  - Không dùng reflection → **nhanh và an toàn type**.

#### Tại sao dùng interface, không viết class tay?

- Nếu viết tay:
  ```java
  public class UserMapper {
      public UserResponse toResponseDTO(User user) {
          UserResponse dto = new UserResponse();
          dto.setEmail(user.getEmail());
          // ... map hàng loạt field
          return dto;
      }
  }
  ```
  - Rất dài, dễ sai, khó maintain.

- Với MapStruct:
  - Ta mô tả mapping ngắn gọn bằng annotation:
    - `@Mapping(target = "roleName", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")`
    - Các field trùng tên sẽ tự map.
  - MapStruct generate code tối ưu và type-safe.

**Lợi ích:**

- Giảm **boilerplate code** khi map giữa Entity ↔ DTO.
- Rõ ràng rule mapping ngay trong interface.
- Dễ change khi thay đổi field mới.

#### Chi tiết các method trong `UserMapper`

- `UserResponse toResponseDTO(User user)`:
  - Map entity `User` sang DTO trả về cho client.
  - Đặc biệt: `roleName` lấy từ `user.getRole().getName()` nếu có role.

- `User toEntity(UserCreateRequest dto)`:
  - Map request khi tạo user mới sang entity.
  - Các field nhạy cảm/không nên cho client set bị ignore:
    - `password` (sẽ set riêng sau khi mã hoá).
    - `id`, `role`, `socialProvider`, `socialId`, `createdAt`, `updatedAt`.

- `void updateUserFromDTO(UserUpdateRequest dto, @MappingTarget User user)`:
  - Dùng khi update:
    - `@BeanMapping(nullValuePropertyMappingStrategy = IGNORE)`:
      - Field nào trong DTO là `null` thì **không đè** lên entity.
      - Cho phép update một phần (partial update / patch).
    - Ignore luôn các field không cho phép user update: `password`, `id`, `email`, `role`, `social*`, `createdAt`, `updatedAt`.

---

## 5. Cách xử lý exception: `AppException`, `ErrorCode`, `GlobalException`

### 5.1. `ErrorCode` – chuẩn hoá lỗi

```java
@Getter
public enum ErrorCode {
    SYSTEM_ERROR(0, "error.system.general", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1, "error.system.invalid-request", HttpStatus.BAD_REQUEST),

    EMAIL_INVALID(1004, "error.validation.email.invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT(1006, "error.validation.password.too-short", HttpStatus.BAD_REQUEST),

    EMAIL_ALREADY_EXISTS(3001, "error.user.email.exists", HttpStatus.CONFLICT),
    ROLE_NOT_FOUND(3002, "error.user.role.not-found", HttpStatus.INTERNAL_SERVER_ERROR),

    EMAIL_REQUIRED(9803, "error.field.email.required", HttpStatus.BAD_REQUEST),
    PASSWORD_REQUIRED(9805, "error.field.password.required", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String messageKey;
    private final HttpStatusCode httpStatusCode;
}
```

- Mỗi loại lỗi có:
  - `code`: mã số business.
  - `messageKey`: key để tra cứu message đa ngôn ngữ (i18n).
  - `httpStatusCode`: HTTP status tương ứng (400, 409, 500, …).

**Lợi ích:**

- Tất cả lỗi trong hệ thống **được chuẩn hoá** theo 1 enum.
- FE có thể dựa vào `code` để xử lý logic (ví dụ: nếu `EMAIL_ALREADY_EXISTS` thì show message cụ thể).

### 5.2. `AppException` – exception custom

```java
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.name());
        this.errorCode = errorCode;
    }
}
```

- Đây là **exception tuỳ biến của dự án**.
- Khi trong service phát hiện lỗi business, ta ném:
  ```java
  throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
  ```
- Không xử lý try/catch từng chỗ, mà để `GlobalException` xử lý tập trung.

### 5.3. `GlobalException` – xử lý lỗi tập trung

```java
@ControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalException {
    private final I18n i18n;

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) { ... }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) { ... }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) { ... }
}
```

- `@ControllerAdvice`:
  - Báo cho Spring đây là class **bắt và xử lý exception chung** cho toàn bộ controller.

#### `handleAppException`

```java
@ExceptionHandler(value = AppException.class)
ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
    ErrorCode errorCode = e.getErrorCode();
    ApiResponse<Void> response = ApiResponse.<Void>builder()
            .code(errorCode.getCode())
            .message(i18n.t(errorCode.getMessageKey()))
            .build();
    return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
}
```

- Khi bất kỳ chỗ nào ném `AppException`, method này sẽ:
  - Lấy `ErrorCode`.
  - Lấy message theo `messageKey` qua `i18n.t(...)` (đa ngôn ngữ).
  - Trả về `ApiResponse` với:
    - `code` = code trong enum.
    - `message` = message i18n.
    - HTTP status = `errorCode.getHttpStatusCode()`.

#### `handleValidationErrors` – xử lý lỗi `@Valid`

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();

    ex.getBindingResult().getAllErrors().forEach(error -> {
        String field = ((FieldError) error).getField();
        String code = error.getDefaultMessage();

        ErrorCode errorCode = Arrays.stream(ErrorCode.values())
                .filter(e -> e.name().equals(code))
                .findFirst()
                .orElse(ErrorCode.INVALID_REQUEST);

        errors.put(field, i18n.t(errorCode.getMessageKey()));
    });

    ErrorCode invalidRequest = ErrorCode.INVALID_REQUEST;
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ApiResponse.<Map<String, String>>builder()
                    .code(invalidRequest.getCode())
                    .message(i18n.t(invalidRequest.getMessageKey()))
                    .data(errors)
                    .build()
    );
}
```

- Khi validation fail (do `@Valid` trên request DTO):
  - Spring ném `MethodArgumentNotValidException`.
  - Ở đây:
    - Lấy danh sách lỗi từng field.
    - `error.getDefaultMessage()` đang được dùng như **tên `ErrorCode`** (ví dụ: `EMAIL_INVALID`, `EMAIL_REQUIRED`).
    - Map từng field → message i18n tương ứng.
  - Trả về:
    - HTTP 400.
    - `ApiResponse`:
      - `code` = code của `INVALID_REQUEST`.
      - `data` = map `{ fieldName: localizedMessage }`.

**Lợi ích:**

- FE nhận được:
  - Message tổng quát (`INVALID_REQUEST`).
  - Đồng thời chi tiết lỗi theo từng field để hiển thị dưới mỗi input.

#### `handleRuntimeException` – fallback

```java
@ExceptionHandler(value = RuntimeException.class)
ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) {
    log.error("error", e);
    ErrorCode errorCode = ErrorCode.SYSTEM_ERROR;
    ApiResponse<Void> response = ApiResponse.<Void>builder()
            .code(errorCode.getCode())
            .message(i18n.t(errorCode.getMessageKey()))
            .build();
    return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
}
```

- Bắt tất cả lỗi runtime **không được xử lý riêng**:
  - Log chi tiết lỗi ở server (`log.error`).
  - Trả về cho client message an toàn dạng chung chung: `SYSTEM_ERROR`.

---

## 6. Tổng kết

- **DI + `final` + `@RequiredArgsConstructor`**: dùng constructor injection, bỏ `@Autowired`, code sạch, dễ test, dependency bất biến.
- **Spring Security config**: quản lý quyền truy cập endpoint tập trung, cho phép `/api/auth/**` public, các path khác cần authenticated, dùng BCrypt để mã hoá password.
- **`ResponseEntity` + `ApiResponse`**: kiểm soát status code tốt, format JSON thống nhất cho FE.
- **`@Builder` + MapStruct `@Mapper`**: giảm boilerplate khi khởi tạo object/mapping DTO–Entity, code rõ ràng, type-safe.
- **`AppException` + `ErrorCode` + `GlobalException`**: chuẩn hoá lỗi, xử lý exception tập trung, hỗ trợ i18n và thông báo chi tiết cho FE.

File này nên được đọc song song với code để hiểu rõ hơn luồng xử lý trong dự án.

