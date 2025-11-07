package com.captainecho.captainecho.protector.application.command;

public record UpdatePinCommand(
        Integer protectorId,
        String currentPin,
        String newPin
) {
}
