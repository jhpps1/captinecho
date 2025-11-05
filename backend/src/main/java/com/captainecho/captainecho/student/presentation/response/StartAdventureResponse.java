package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.StartAdventureResult;

public record StartAdventureResponse(
        Boolean success
) {
    public static StartAdventureResponse from(StartAdventureResult result) {
        return new StartAdventureResponse(result.success());
    }
}
