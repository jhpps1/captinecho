package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetStudentInterestResult(
        Integer studentId,
        List<StudentInterestInfo> interests
) {
    public record StudentInterestInfo(
            Short subInterestId,
            String subInterestName,
            Short majorInterestId,
            String majorInterestName
    ) {
    }
}
