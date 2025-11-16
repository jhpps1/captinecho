package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetTotalJamoStatResult(
        List<AccuracyRate> accuracyRates
) {
    public static GetTotalJamoStatResult of(List<AccuracyRate> accuracyRates) {
        return new GetTotalJamoStatResult(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate,
            Integer count
    ) {
    }
}
