package com.captainecho.captainecho.protector.application.command;

public record CreatePinCommand(
        Long protectorId,
        String pin
) {
}
