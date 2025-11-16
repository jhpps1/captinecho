package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetWorstImproveJamoResult;

import java.util.List;
import java.util.stream.Collectors;

public record WorstImproveJamoResponse(
        List<WorstJamo> worstJamos
) {
    public static WorstImproveJamoResponse from(GetWorstImproveJamoResult result) {
        List<WorstJamo> worstJamos = result.worstJamos().stream()
                .map(wj -> new WorstJamo(
                        wj.jamo(),
                        wj.twoWeeksAgo(),
                        wj.lastWeek(),
                        wj.improveRate()
                ))
                .collect(Collectors.toList());

        return new WorstImproveJamoResponse(worstJamos);
    }

    public record WorstJamo(
            String jamo,
            Integer twoWeeksAgo,
            Integer lastWeek,
            Integer improveRate
    ) {
    }
}
