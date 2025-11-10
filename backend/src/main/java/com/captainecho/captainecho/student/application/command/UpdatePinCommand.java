package com.captainecho.captainecho.student.application.command;

public record UpdatePinCommand(
        Integer studentId,
        String currentPin,
        String newPin
) {
}
