package com.captainecho.captainecho.protector.application.command;

public record VerifyPinCommand(
        Integer protectorId,
        String pin
) {
}
