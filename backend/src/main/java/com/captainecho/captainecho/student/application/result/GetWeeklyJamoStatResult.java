package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetWeeklyJamoStatResult(
        List<AccuracyRate> accuracyRates
) {
    public static GetWeeklyJamoStatResult of(List<AccuracyRate> accuracyRates) {
        return new GetWeeklyJamoStatResult(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate,
            Integer count
    ) {
    }
}
