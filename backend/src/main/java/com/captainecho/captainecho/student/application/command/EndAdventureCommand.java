package com.captainecho.captainecho.student.application.command;

public record EndAdventureCommand(
        Integer studentId,
        Long protectorId
) {
}
