package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record AddStudentInterestResult(
        Integer studentId,
        List<GetStudentInterestResult.StudentInterestInfo> interests
) {
}
