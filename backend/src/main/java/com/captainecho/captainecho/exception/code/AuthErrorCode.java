package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum AuthErrorCode implements ErrorCode {
    // 400 BAD REQUEST
    INVALID_PROVIDER(HttpStatus.BAD_REQUEST, "AU40001", "지원하지 않는 소셜 제공자입니다"),
    DUPLICATE_USERNAME(HttpStatus.BAD_REQUEST, "AU40002", "이미 사용 중인 아이디입니다"),
    DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "AU40003", "이미 사용 중인 이메일입니다"),
    INVALID_PASSWORD_FORMAT(HttpStatus.BAD_REQUEST, "AU40004", "비밀번호 형식이 올바르지 않습니다"),
    INVALID_RECOVERY_CODE(HttpStatus.BAD_REQUEST, "AU40005", "유효하지 않은 복구 코드입니다"),

    // 401 UNAUTHORIZED
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AU40101", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "AU40102", "만료된 토큰입니다"),

    // 403 FORBIDDEN
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AU40301", "접근 권한이 없습니다"),

    // 404 NOT FOUND
    PROTECTOR_NOT_FOUND(HttpStatus.NOT_FOUND, "AU40401", "보호자를 찾을 수 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
