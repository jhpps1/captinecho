package com.captainecho.captainecho.student.application.result;

public record StartAdventureResult(
        Integer sessionId
) {
    public static StartAdventureResult from(Integer sessionId) {
        return new StartAdventureResult(sessionId);
    }
}
