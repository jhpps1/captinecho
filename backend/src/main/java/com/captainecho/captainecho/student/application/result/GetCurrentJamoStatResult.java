package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetCurrentJamoStatResult(
        List<AccuracyRate> accuracyRates
) {
    public static GetCurrentJamoStatResult of(List<AccuracyRate> accuracyRates) {
        return new GetCurrentJamoStatResult(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate,
            Integer count
    ) {
    }
}
