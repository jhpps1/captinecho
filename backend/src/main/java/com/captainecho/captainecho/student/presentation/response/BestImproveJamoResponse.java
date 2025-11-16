package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetBestImproveJamoResult;

import java.util.List;
import java.util.stream.Collectors;

public record BestImproveJamoResponse(
        List<BestJamo> bestJamos
) {
    public static BestImproveJamoResponse from(GetBestImproveJamoResult result) {
        List<BestJamo> bestJamos = result.bestJamos().stream()
                .map(bj -> new BestJamo(
                        bj.jamo(),
                        bj.twoWeeksAgo(),
                        bj.lastWeek(),
                        bj.improveRate()
                ))
                .collect(Collectors.toList());

        return new BestImproveJamoResponse(bestJamos);
    }

    public record BestJamo(
            String jamo,
            Integer twoWeeksAgo,
            Integer lastWeek,
            Integer improveRate
    ) {
    }
}
