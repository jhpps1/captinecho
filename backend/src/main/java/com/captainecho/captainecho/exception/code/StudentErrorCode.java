package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum StudentErrorCode implements ErrorCode {
    // 400 BAD REQUEST
    MAX_STUDENT_COUNT_EXCEEDED(HttpStatus.BAD_REQUEST, "ST40001", "등록 가능한 최대 학생 수를 초과했습니다"),
    INVALID_SUB_INTEREST(HttpStatus.BAD_REQUEST, "ST40002", "유효하지 않은 관심사입니다"),
    INVALID_INTEREST_COUNT(HttpStatus.BAD_REQUEST, "ST40003", "관심사는 최소 1개, 최대 5개까지 등록 가능합니다"),
    INVALID_GRADE(HttpStatus.BAD_REQUEST, "ST40004", "유효하지 않은 학년입니다"),
    DUPLICATE_INTEREST(HttpStatus.BAD_REQUEST, "ST40005", "이미 등록된 관심사입니다"),
    INTEREST_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "ST40006", "관심사는 최대 5개까지 등록 가능합니다"),
    SESSION_ALREADY_IN_PROGRESS(HttpStatus.BAD_REQUEST, "ST40005", "이미 진행 중인 학습 세션이 있습니다"),

    // 403 FORBIDDEN
    STUDENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ST40301", "해당 학생에 대한 접근 권한이 없습니다"),

    // 404 NOT FOUND
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40401", "학생을 찾을 수 없습니다"),
    NO_ONGOING_SESSION(HttpStatus.NOT_FOUND, "ST40402", "진행 중인 학습 세션이 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
