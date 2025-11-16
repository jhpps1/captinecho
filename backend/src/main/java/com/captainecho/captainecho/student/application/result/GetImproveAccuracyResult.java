package com.captainecho.captainecho.student.application.result;

public record GetImproveAccuracyResult(
        Integer twoWeeksAgo,
        Integer lastWeek,
        Integer improveRate
) {
    public static GetImproveAccuracyResult of(Integer twoWeeksAgo, Integer lastWeek, Integer improveRate) {
        return new GetImproveAccuracyResult(twoWeeksAgo, lastWeek, improveRate);
    }
}
