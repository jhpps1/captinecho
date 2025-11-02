package com.captainecho.captainecho.protector.application.command;

public record VerifyPinCommand(
        Long protectorId,
        String pin
) {
}
