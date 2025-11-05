package com.captainecho.captainecho.student.application.result;

public record EndAdventureResult(
        Boolean success
) {
    public static EndAdventureResult from(Boolean success) {
        return new EndAdventureResult(success);
    }
}
