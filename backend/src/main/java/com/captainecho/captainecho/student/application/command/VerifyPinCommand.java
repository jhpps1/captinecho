package com.captainecho.captainecho.student.application.command;

public record VerifyPinCommand(
        Integer studentId,
        String pin
) {
}
