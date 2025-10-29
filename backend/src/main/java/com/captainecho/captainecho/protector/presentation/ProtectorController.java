package com.captainecho.captainecho.protector.presentation;

import com.captainecho.captainecho.protector.application.ProtectorService;
import com.captainecho.captainecho.protector.application.result.LoginResult;
import com.captainecho.captainecho.protector.presentation.request.LoginRequest;
import com.captainecho.captainecho.protector.presentation.response.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 보호자 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/protector")
@RequiredArgsConstructor
public class ProtectorController {

    private final ProtectorService protectorService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = protectorService.login(request.toCommand());

        LoginResponse response = LoginResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
