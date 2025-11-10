package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.UpdateStudentResult;

public record UpdateStudentResponse(
        boolean success
) {
    public static UpdateStudentResponse from(UpdateStudentResult result) {
        return new UpdateStudentResponse(result.success());
    }
}
