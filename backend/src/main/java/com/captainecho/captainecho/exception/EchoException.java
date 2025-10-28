package com.captainecho.captainecho.exception;

import com.captainecho.captainecho.exception.code.ErrorCode;
import lombok.Getter;

@Getter
public class EchoException extends RuntimeException {
    private final ErrorCode errorCode;

    public EchoException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public EchoException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
