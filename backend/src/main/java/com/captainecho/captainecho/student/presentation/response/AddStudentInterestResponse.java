package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.AddStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetStudentInterestResult;

import java.util.List;

public record AddStudentInterestResponse(
        Integer studentId,
        List<StudentInterestInfo> interests
) {
    public static AddStudentInterestResponse from(AddStudentInterestResult result) {
        List<StudentInterestInfo> interestInfos = result.interests().stream()
                .map(info -> new StudentInterestInfo(
                        info.subInterestId(),
                        info.subInterestName(),
                        info.majorInterestId(),
                        info.majorInterestName()
                ))
                .toList();

        return new AddStudentInterestResponse(result.studentId(), interestInfos);
    }

    public record StudentInterestInfo(
            Short subInterestId,
            String subInterestName,
            Short majorInterestId,
            String majorInterestName
    ) {
    }
}
