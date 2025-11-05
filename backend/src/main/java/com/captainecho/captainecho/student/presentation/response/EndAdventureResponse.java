package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.EndAdventureResult;

public record EndAdventureResponse(
        Boolean success
) {
    public static EndAdventureResponse from(EndAdventureResult result) {
        return new EndAdventureResponse(result.success());
    }
}
