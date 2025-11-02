package com.captainecho.captainecho.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EchoException.class)
    public ResponseEntity<ErrorResponse> handleEchoException(EchoException e) {
        return ResponseEntity.status(e.getErrorCode().getHttpStatus())
                .body(ErrorResponse.fail(e.getErrorCode().getCode(), e.getMessage()));
    }
}
