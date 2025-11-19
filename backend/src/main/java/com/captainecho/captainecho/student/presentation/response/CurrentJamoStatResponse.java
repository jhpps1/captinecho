package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetCurrentJamoStatResult;

import java.util.List;
import java.util.stream.Collectors;

public record CurrentJamoStatResponse(
        List<AccuracyRate> accuracyRates
) {
    public static CurrentJamoStatResponse from(GetCurrentJamoStatResult result) {
        List<AccuracyRate> accuracyRates = result.accuracyRates().stream()
                .map(ar -> new AccuracyRate(ar.jamo(), ar.accuracyRate(), ar.count()))
                .collect(Collectors.toList());

        return new CurrentJamoStatResponse(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate,
            Integer count
    ) {
    }
}
