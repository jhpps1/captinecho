package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.DeleteStudentInterestResult;

public record DeleteStudentInterestResponse(
        boolean success
) {
    public static DeleteStudentInterestResponse from(DeleteStudentInterestResult result) {
        return new DeleteStudentInterestResponse(result.success());
    }
}
