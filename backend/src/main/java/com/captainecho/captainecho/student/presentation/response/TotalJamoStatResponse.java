package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetTotalJamoStatResult;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.stream.Collectors;

public record TotalJamoStatResponse(
        @Schema(description = "정답률 목록")
        List<AccuracyRate> accuracyRates
) {
    public static TotalJamoStatResponse from(GetTotalJamoStatResult result) {
        List<AccuracyRate> accuracyRates = result.accuracyRates().stream()
                .map(ar -> new AccuracyRate(ar.jamo(), ar.accuracyRate(), ar.count()))
                .collect(Collectors.toList());

        return new TotalJamoStatResponse(accuracyRates);
    }

    public record AccuracyRate(
            @Schema(description = "자모음", example = "ㄱ")
            String jamo,
            @Schema(description = "정답률 (%)", example = "85")
            Integer accuracyRate,
            @Schema(description = "해당 자모 시도 횟수", example = "120")
            Integer count
    ) {
    }
}
