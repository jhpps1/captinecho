package com.captainecho.captainecho.protector.application.command;

public record UpdateEmailCommand(
        Integer protectorId,
        String newEmail
) {
}
