package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetWeeklyJamoStatResult;

import java.util.List;
import java.util.stream.Collectors;

public record GetWeeklyJamoStatResponse(
        List<AccuracyRate> accuracyRates
) {
    public static GetWeeklyJamoStatResponse from(GetWeeklyJamoStatResult result) {
        List<AccuracyRate> accuracyRates = result.accuracyRates().stream()
                .map(ar -> new AccuracyRate(ar.jamo(), ar.accuracyRate()))
                .collect(Collectors.toList());

        return new GetWeeklyJamoStatResponse(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate
    ) {
    }
}
