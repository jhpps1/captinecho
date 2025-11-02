package com.captainecho.captainecho.protector.presentation;

import com.captainecho.captainecho.protector.application.ProtectorService;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.presentation.request.CreatePinRequest;
import com.captainecho.captainecho.protector.presentation.response.CreatePinResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/protector")
@RequiredArgsConstructor
public class ProtectorController {

    private final ProtectorService protectorService;

    @PostMapping("/pin")
    public ResponseEntity<CreatePinResponse> createPin(@Valid @RequestBody CreatePinRequest request) {
        // TODO: JWT에서 protectorId 추출 (현재는 임시로 1L 사용)
        Long protectorId = 1L;

        CreatePinResult result = protectorService.createPin(request.toCommand(protectorId));

        CreatePinResponse response = CreatePinResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
