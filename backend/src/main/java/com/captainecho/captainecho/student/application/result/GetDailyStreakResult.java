package com.captainecho.captainecho.student.application.result;

import java.util.List;

public record GetDailyStreakResult(
        List<Boolean> weeklyAttendance,  // 월~금 5일의 학습 여부
        Integer currentStreak             // 현재 연속 학습일 수
) {
    public static GetDailyStreakResult of(List<Boolean> weeklyAttendance, Integer currentStreak) {
        return new GetDailyStreakResult(weeklyAttendance, currentStreak);
    }
}
