package com.captainecho.captainecho.protector.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.protector.application.ProtectorService;
import com.captainecho.captainecho.protector.application.command.GetStudentCountCommand;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.application.result.GetStudentCountResult;
import com.captainecho.captainecho.protector.application.result.UpdatePinResult;
import com.captainecho.captainecho.protector.application.result.VerifyPinResult;
import com.captainecho.captainecho.protector.application.result.StudentListResult;
import com.captainecho.captainecho.protector.presentation.dto.VerifyPinRequest;
import com.captainecho.captainecho.protector.presentation.dto.VerifyPinResponse;
import com.captainecho.captainecho.protector.presentation.request.CreatePinRequest;
import com.captainecho.captainecho.protector.presentation.request.UpdatePinRequest;
import com.captainecho.captainecho.protector.presentation.request.UpdateTermsRequest;
import com.captainecho.captainecho.protector.presentation.request.VerifyRecoveryCodeRequest;
import com.captainecho.captainecho.protector.presentation.response.CreatePinResponse;
import com.captainecho.captainecho.protector.presentation.response.GetStudentCountResponse;
import com.captainecho.captainecho.protector.presentation.response.RecoveryCodeResponse;
import com.captainecho.captainecho.protector.presentation.response.StudentListResponse;
import com.captainecho.captainecho.protector.presentation.response.UpdatePinResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
        Integer protectorId = principal.getProtectorId();

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

        Integer protectorId = principal.getProtectorId();

        VerifyPinResult result = protectorService.verifyPin(request.toCommand(protectorId));

        VerifyPinResponse response = VerifyPinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 보호자의 학생 목록 조회
     * GET /api/protector/students
     */
    @GetMapping("/students")
    public ResponseEntity<StudentListResponse> getStudents(
            @AuthenticationPrincipal ProtectorPrincipal principal
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        StudentListResult result = protectorService.getStudents(protectorId);
        StudentListResponse response = StudentListResponse.from(result);

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

        Integer protectorId = principal.getProtectorId();

        UpdatePinResult result = protectorService.updatePin(request.toCommand(protectorId));

        UpdatePinResponse response = UpdatePinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 보호자의 학생 계정 수 조회
     * GET /api/protector/student/count
     */
    @GetMapping("/student/count")
    public ResponseEntity<GetStudentCountResponse> getStudentCount(
            @AuthenticationPrincipal ProtectorPrincipal principal
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetStudentCountCommand command = new GetStudentCountCommand(protectorId);
        GetStudentCountResult result = protectorService.getStudentCount(command);
        GetStudentCountResponse response = GetStudentCountResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * PIN 복구 인증 코드 전송
     * POST /api/protector/pin/send-recovery-code
     */
    @PostMapping("/pin/send-recovery-code")
    public ResponseEntity<RecoveryCodeResponse> sendRecoveryCode(
            @AuthenticationPrincipal ProtectorPrincipal principal
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        protectorService.sendRecoveryCode(protectorId);

        return ResponseEntity.ok(RecoveryCodeResponse.of(true));
    }

    /**
     * PIN 복구 인증 코드 검증 및 PIN 초기화
     * POST /api/protector/pin/verify-recovery-code
     */
    @PostMapping("/pin/verify-recovery-code")
    public ResponseEntity<RecoveryCodeResponse> verifyRecoveryCode(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody VerifyRecoveryCodeRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        protectorService.verifyRecoveryCodeAndResetPin(protectorId, request.code());

        return ResponseEntity.ok(RecoveryCodeResponse.of(true));
    }

    /**
     * 약관 동의 업데이트
     * PATCH /api/protector/terms
     */
    @PatchMapping("/terms")
    public ResponseEntity<Void> updateTermsAgreed(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody UpdateTermsRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        protectorService.updateTermsAgreed(protectorId, request.termsAgreed());

        return ResponseEntity.ok().build();
    }
}
