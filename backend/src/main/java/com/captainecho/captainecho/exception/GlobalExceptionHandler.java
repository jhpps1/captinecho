package com.captainecho.captainecho.exception;

import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EchoException.class)
    public ResponseEntity<ErrorResponse> handleEchoException(EchoException e) {
        return ResponseEntity.status(e.getErrorCode().getHttpStatus())
                .body(ErrorResponse.fail(e.getErrorCode().getCode(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String field = e.getBindingResult().getFieldError().getField();
        String defaultMessage = e.getBindingResult().getFieldError().getDefaultMessage();

        // PIN 필드 검증 오류인 경우 PIN_INVALID_FORMAT 에러 코드 사용
        if (field.contains("Pin") || field.contains("pin")) {
            return ResponseEntity.status(ProtectorErrorCode.PIN_INVALID_FORMAT.getHttpStatus())
                    .body(ErrorResponse.fail(
                            ProtectorErrorCode.PIN_INVALID_FORMAT.getCode(),
                            defaultMessage != null ? defaultMessage : ProtectorErrorCode.PIN_INVALID_FORMAT.getMessage()
                    ));
        }

        // 기본 검증 오류 처리
        return ResponseEntity.badRequest()
                .body(ErrorResponse.fail("VALIDATION_ERROR", defaultMessage != null ? defaultMessage : "입력값이 올바르지 않습니다"));
    }
}
