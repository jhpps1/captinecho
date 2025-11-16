package com.captainecho.captainecho.auth.application.command;

public record LocalLoginCommand(
        String username,
        String password
) {
}
