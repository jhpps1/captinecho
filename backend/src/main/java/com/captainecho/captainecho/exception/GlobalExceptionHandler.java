package com.captainecho.captainecho.exception;

import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.validation.ConstraintViolationException;

@Slf4j
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
        return ResponseEntity.status(CommonErrorCode.VALIDATION_ERROR.getHttpStatus())
                .body(ErrorResponse.fail(
                        CommonErrorCode.VALIDATION_ERROR.getCode(),
                        defaultMessage != null ? defaultMessage : CommonErrorCode.VALIDATION_ERROR.getMessage()
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        log.error("Database constraint violation: ", e);

        CommonErrorCode errorCode = CommonErrorCode.DB_CONSTRAINT_VIOLATION;

        // 상세 에러 메시지 파싱
        if (e.getMessage() != null) {
            if (e.getMessage().contains("foreign key constraint")) {
                errorCode = CommonErrorCode.DB_FOREIGN_KEY_VIOLATION;
            } else if (e.getMessage().contains("unique constraint")) {
                errorCode = CommonErrorCode.DB_UNIQUE_VIOLATION;
            } else if (e.getMessage().contains("not-null")) {
                errorCode = CommonErrorCode.DB_NOT_NULL_VIOLATION;
            }
        }

        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ErrorResponse.fail(errorCode.getCode(), errorCode.getMessage()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException e) {
        log.error("Constraint violation: ", e);

        String message = e.getMessage() != null ? e.getMessage() : CommonErrorCode.CONSTRAINT_VIOLATION.getMessage();

        return ResponseEntity.status(CommonErrorCode.CONSTRAINT_VIOLATION.getHttpStatus())
                .body(ErrorResponse.fail(CommonErrorCode.CONSTRAINT_VIOLATION.getCode(), message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.error("JSON parsing error: ", e);

        // 잘못된 enum 값이나 JSON 형식 오류 처리
        String message = CommonErrorCode.INVALID_TYPE_VALUE.getMessage();

        // 상세 메시지에서 enum 관련 정보 추출
        if (e.getMessage() != null && e.getMessage().contains("Enum")) {
            message = "잘못된 입력값입니다 유효한 값을 입력해주세요";
        }

        return ResponseEntity.status(CommonErrorCode.INVALID_TYPE_VALUE.getHttpStatus())
                .body(ErrorResponse.fail(CommonErrorCode.INVALID_TYPE_VALUE.getCode(), message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        log.error("Unexpected error occurred: ", e);

        return ResponseEntity.status(CommonErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ErrorResponse.fail(
                        CommonErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                        CommonErrorCode.INTERNAL_SERVER_ERROR.getMessage()
                ));
    }
}
