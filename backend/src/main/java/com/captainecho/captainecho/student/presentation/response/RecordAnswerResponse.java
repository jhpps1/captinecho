package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.RecordAnswerResult;

public record RecordAnswerResponse(
        Boolean success
) {
    public static RecordAnswerResponse from(RecordAnswerResult result) {
        return new RecordAnswerResponse(result.success());
    }
}
