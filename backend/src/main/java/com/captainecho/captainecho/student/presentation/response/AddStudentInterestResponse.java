package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.AddStudentInterestResult;

public record AddStudentInterestResponse(
        boolean success
) {
    public static AddStudentInterestResponse from(AddStudentInterestResult result) {
        return new AddStudentInterestResponse(result.success());
    }
}
