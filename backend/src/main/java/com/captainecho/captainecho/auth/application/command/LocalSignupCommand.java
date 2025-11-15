package com.captainecho.captainecho.auth.application.command;

public record LocalSignupCommand(
        String username,
        String password,
        String email
) {
}
