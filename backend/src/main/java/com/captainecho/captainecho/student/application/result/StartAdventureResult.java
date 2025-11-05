package com.captainecho.captainecho.student.application.result;

public record StartAdventureResult(
        Boolean success
) {
    public static StartAdventureResult from(Boolean success) {
        return new StartAdventureResult(success);
    }
}
