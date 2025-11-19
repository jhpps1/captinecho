package com.captainecho.captainecho.student.application.result;

public record GetDailyAccuracyResult(
        Integer accuracy
) {
    public static GetDailyAccuracyResult of(Integer accuracy) {
        return new GetDailyAccuracyResult(accuracy);
    }
}
