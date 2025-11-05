package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.StartAdventureResult;

public record StartAdventureResponse(
        Integer sessionId
) {
    public static StartAdventureResponse from(StartAdventureResult result) {
        return new StartAdventureResponse(result.sessionId());
    }
}
