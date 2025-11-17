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
    SESSION_ALREADY_IN_PROGRESS(HttpStatus.BAD_REQUEST, "ST40007", "이미 진행 중인 학습 세션이 있습니다"),
    EMPTY_FILE(HttpStatus.BAD_REQUEST, "ST40008", "빈 파일은 업로드할 수 없습니다"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "ST40009", "지원하지 않는 파일 형식입니다"),
    FILE_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "ST40010", "파일 크기가 제한을 초과했습니다"),
    PIN_NOT_MATCH(HttpStatus.BAD_REQUEST, "ST40011", "PIN이 일치하지 않습니다"),
    INVALID_RECOVERY_CODE(HttpStatus.BAD_REQUEST, "ST40013", "유효하지 않은 복구 코드입니다"),

    // 403 FORBIDDEN
    STUDENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ST40301", "해당 학생에 대한 접근 권한이 없습니다"),

    // 404 NOT FOUND,
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40401", "학생을 찾을 수 없습니다"),
    NO_ONGOING_SESSION(HttpStatus.NOT_FOUND, "ST40402", "진행 중인 학습 세션이 없습니다"),
    STUDENT_INTEREST_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40403", "학생 관심사를 찾을 수 없습니다"),
    PROBLEM_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40404", "문제를 찾을 수 없습니다"),
    PIN_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40405", "PIN이 등록되지 않았습니다"),
    EMAIL_NOT_FOUND(HttpStatus.NOT_FOUND, "ST40406", "보호자 이메일을 찾을 수 없습니다"),
    PROBLEM_NOT_ASSIGNED(HttpStatus.FORBIDDEN, "ST40302", "해당 문제는 학생에게 할당되지 않았습니다"),

    // 500 INTERNAL SERVER ERROR
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "ST50001", "파일 업로드 중 오류가 발생했습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
