package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum CommonErrorCode implements ErrorCode {
    // 400 BAD REQUEST
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "CM40001", "잘못된 입력값입니다"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "CM40002", "잘못된 타입입니다"),
    MISSING_INPUT_VALUE(HttpStatus.BAD_REQUEST, "CM40003", "필수 입력값이 누락되었습니다"),

    // 401 UNAUTHORIZED
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "CM40101", "인증이 필요합니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "CM40102", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "CM40103", "만료된 토큰입니다"),

    // 403 FORBIDDEN
    FORBIDDEN(HttpStatus.FORBIDDEN, "CM40301", "접근 권한이 없습니다"),

    // 404 NOT FOUND
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "CM40401", "요청한 리소스를 찾을 수 없습니다"),

    // 409 CONFLICT
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "CM40901", "이미 존재하는 리소스입니다"),

    // 500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "CM50001", "서버 내부 오류가 발생했습니다"),
    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
