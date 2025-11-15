package com.captainecho.captainecho.auth.presentation;

import com.captainecho.captainecho.auth.application.AuthService;
import com.captainecho.captainecho.auth.application.result.LoginResult;
import com.captainecho.captainecho.auth.presentation.request.LocalSignupRequest;
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

    @PostMapping("/social/login")
    public ResponseEntity<LoginResponse> socialLogin(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request.toCommand());

        LoginResponse response = LoginResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/local/signup")
    public ResponseEntity<LoginResponse> localSignup(@Valid @RequestBody LocalSignupRequest request) {
        LoginResult result = authService.localSignup(request.toCommand());

        LoginResponse response = LoginResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
