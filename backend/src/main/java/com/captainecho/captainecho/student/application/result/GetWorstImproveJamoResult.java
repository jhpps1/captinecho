package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetWorstImproveJamoResult(
        List<WorstJamo> worstJamos
) {
    public static GetWorstImproveJamoResult of(List<WorstJamo> worstJamos) {
        return new GetWorstImproveJamoResult(worstJamos);
    }

    public record WorstJamo(
            String jamo,
            Integer twoWeeksAgo,
            Integer lastWeek,
            Integer improveRate
    ) {
    }
}
