package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetTotalJamoStatResult;

import java.util.List;
import java.util.stream.Collectors;

public record TotalJamoStatResponse(
        List<AccuracyRate> accuracyRates
) {
    public static TotalJamoStatResponse from(GetTotalJamoStatResult result) {
        List<AccuracyRate> accuracyRates = result.accuracyRates().stream()
                .map(ar -> new AccuracyRate(ar.jamo(), ar.accuracyRate(), ar.count()))
                .collect(Collectors.toList());

        return new TotalJamoStatResponse(accuracyRates);
    }

    public record AccuracyRate(
            String jamo,
            Integer accuracyRate,
            Integer count
    ) {
    }
}
