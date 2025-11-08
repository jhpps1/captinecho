package com.captainecho.captainecho.student.application.result;

public record RecordAnswerResult(
        Boolean success
) {
    public static RecordAnswerResult from(Boolean success) {
        return new RecordAnswerResult(success);
    }
}
