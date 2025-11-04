package com.captainecho.captainecho.dashboard.application.result;

public record CurriculumResult(
        String curriculum
) {
    public static CurriculumResult from(String curriculum) {
        return new CurriculumResult(curriculum);
    }
}
