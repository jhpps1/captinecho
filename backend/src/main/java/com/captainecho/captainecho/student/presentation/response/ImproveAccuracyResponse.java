package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetImproveAccuracyResult;

public record ImproveAccuracyResponse(
        Integer twoWeeksAgo,
        Integer lastWeek,
        Integer improveRate
) {
    public static ImproveAccuracyResponse from(GetImproveAccuracyResult result) {
        return new ImproveAccuracyResponse(
                result.twoWeeksAgo(),
                result.lastWeek(),
                result.improveRate()
        );
    }
}
