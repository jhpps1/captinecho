package com.captainecho.captainecho.auth.presentation;

import com.captainecho.captainecho.auth.application.AuthService;
import com.captainecho.captainecho.auth.application.result.LoginResult;
import com.captainecho.captainecho.auth.presentation.request.LoginRequest;
import com.captainecho.captainecho.auth.presentation.response.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request.toCommand());

        LoginResponse response = LoginResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
