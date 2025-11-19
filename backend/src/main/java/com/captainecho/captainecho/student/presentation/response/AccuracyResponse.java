package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetDailyAccuracyResult;
import com.captainecho.captainecho.student.application.result.GetWeeklyAccuracyResult;

public record AccuracyResponse(
        Integer accuracy
) {
    public static AccuracyResponse fromDaily(GetDailyAccuracyResult result) {
        return new AccuracyResponse(result.accuracy());
    }

    public static AccuracyResponse fromWeekly(GetWeeklyAccuracyResult result) {
        return new AccuracyResponse(result.accuracy());
    }
}
