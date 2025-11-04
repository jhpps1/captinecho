package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum ProtectorErrorCode implements ErrorCode {
    // 400 BAD REQUEST
    PIN_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "PR40001", "이미 PIN이 등록되어 있습니다"),
    PIN_INVALID_FORMAT(HttpStatus.BAD_REQUEST, "PR40002", "PIN은 6자리 숫자여야합니다"),
    PIN_NOT_MATCH(HttpStatus.BAD_REQUEST, "PR40003", "등록된 PIN이 일치하지 않습니다"),

    // 404 NOT FOUND
    PROTECTOR_NOT_FOUND(HttpStatus.NOT_FOUND, "PR40400", "보호자를 찾을 수 없습니다"),
    PIN_NOT_FOUND(HttpStatus.NOT_FOUND, "PR40401", "등록된 PIN이 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
