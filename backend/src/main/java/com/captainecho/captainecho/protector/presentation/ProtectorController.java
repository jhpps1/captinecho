package com.captainecho.captainecho.protector.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.protector.application.ProtectorService;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.application.result.UpdatePinResult;
import com.captainecho.captainecho.protector.application.result.VerifyPinResult;
import com.captainecho.captainecho.protector.presentation.dto.VerifyPinRequest;
import com.captainecho.captainecho.protector.presentation.dto.VerifyPinResponse;
import com.captainecho.captainecho.protector.presentation.request.CreatePinRequest;
import com.captainecho.captainecho.protector.presentation.request.UpdatePinRequest;
import com.captainecho.captainecho.protector.presentation.response.CreatePinResponse;
import com.captainecho.captainecho.protector.presentation.response.UpdatePinResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/protector")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ProtectorController {

    private final ProtectorService protectorService;

    @PostMapping("/pin")
    public ResponseEntity<CreatePinResponse> createPin(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody CreatePinRequest request
    ) {
        Long protectorId = principal.getProtectorId();

        CreatePinResult result = protectorService.createPin(request.toCommand(protectorId));

        CreatePinResponse response = CreatePinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/pin/verify")
    public ResponseEntity<VerifyPinResponse> verifyPin(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody VerifyPinRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        VerifyPinResult result = protectorService.verifyPin(request.toCommand(protectorId));

        VerifyPinResponse response = VerifyPinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pin")
    public ResponseEntity<UpdatePinResponse> updatePin(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody UpdatePinRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        UpdatePinResult result = protectorService.updatePin(request.toCommand(protectorId));

        UpdatePinResponse response = UpdatePinResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
