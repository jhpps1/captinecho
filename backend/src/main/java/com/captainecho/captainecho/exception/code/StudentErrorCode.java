package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum StudentErrorCode implements ErrorCode {
    // 404 NOT FOUND
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40400", "학생을 찾을 수 없습니다"),

    // 403 FORBIDDEN
    STUDENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ST40300", "해당 학생에 대한 접근 권한이 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
