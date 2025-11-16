package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetBestImproveJamoResult(
        List<BestJamo> bestJamos
) {
    public static GetBestImproveJamoResult of(List<BestJamo> bestJamos) {
        return new GetBestImproveJamoResult(bestJamos);
    }

    public record BestJamo(
            String jamo,
            Integer twoWeeksAgo,
            Integer lastWeek,
            Integer improveRate
    ) {
    }
}
