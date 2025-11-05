package com.captainecho.captainecho.exception.code;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public enum DiagnosisErrorCode implements ErrorCode {
    // 400 BAD REQUEST
    DIAGNOSIS_ALREADY_ENDED(HttpStatus.BAD_REQUEST, "DG40001", "이미 종료된 진단입니다"),

    // 404 NOT FOUND
    DIAGNOSIS_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "DG40401", "진단 세션을 찾을 수 없습니다"),
    DIAGNOSIS_NOT_STARTED(HttpStatus.NOT_FOUND, "DG40402", "시작되지 않은 진단입니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
