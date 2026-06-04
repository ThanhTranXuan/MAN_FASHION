package com.manfashion.springboot_be.exception;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
//import com.manfashion.springboot_be.util.language.I18n;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalException {
//    private final I18n i18n;
    private String resolveMessage(String messageKey) {
        if ("error.system.general".equals(messageKey)) {
            return "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return messageKey;
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(resolveMessage(errorCode.getMessageKey()))
                .build();
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException e) {
        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(resolveMessage(errorCode.getMessageKey()))
                .build();
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        // Lấy tất cả lỗi
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String defaultMessage = error.getDefaultMessage();

            ErrorCode errorCode = Arrays.stream(ErrorCode.values())
                    .filter(e -> e.name().equals(defaultMessage))
                    .findFirst()
                    .orElse(ErrorCode.INVALID_REQUEST);

            errors.put(field, errorCode.getMessageKey());
        });

        // Lấy code + message của **field lỗi đầu tiên**
        ErrorCode firstErrorCode = ex.getBindingResult().getAllErrors().isEmpty()
                ? ErrorCode.INVALID_REQUEST
                : Arrays.stream(ErrorCode.values())
                .filter(e -> e.name().equals(ex.getBindingResult().getAllErrors().get(0).getDefaultMessage()))
                .findFirst()
                .orElse(ErrorCode.INVALID_REQUEST);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.<Map<String, String>>builder()
                        .code(firstErrorCode.getCode())
                        .message(resolveMessage(firstErrorCode.getMessageKey()))
                        .data(errors)
                        .build()
        );
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) {
        log.error("error", e);
        ErrorCode errorCode = ErrorCode.SYSTEM_ERROR;
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(resolveMessage(errorCode.getMessageKey()))
                .build();
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }
}

