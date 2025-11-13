package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetDailyStreakResult;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "일일 연속 학습 기록 응답")
public record DailyStreakResponse(
        @Schema(description = "이번 주 월~금 학습 여부 배열 (길이 5)", example = "[true, true, false, true, true]")
        List<Boolean> weeklyAttendance,

        @Schema(description = "현재 연속 학습일 수 (optional)", example = "3")
        Integer currentStreak
) {
    public static DailyStreakResponse from(GetDailyStreakResult result) {
        return new DailyStreakResponse(
                result.weeklyAttendance(),
                result.currentStreak()
        );
    }
}
