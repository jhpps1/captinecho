package com.captainecho.captainecho.protector.application.command;

public record CreatePinCommand(
        Integer protectorId,
        String pin
) {
}
