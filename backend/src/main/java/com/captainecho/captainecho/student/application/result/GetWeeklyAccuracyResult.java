package com.captainecho.captainecho.student.application.result;

public record GetWeeklyAccuracyResult(
        Integer accuracy
) {
    public static GetWeeklyAccuracyResult of(Integer accuracy) {
        return new GetWeeklyAccuracyResult(accuracy);
    }
}
