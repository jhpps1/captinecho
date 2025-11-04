package com.captainecho.captainecho.protector.application.command;

public record UpdatePinCommand(
        Long protectorId,
        String currentPin,
        String newPin
) {
}
