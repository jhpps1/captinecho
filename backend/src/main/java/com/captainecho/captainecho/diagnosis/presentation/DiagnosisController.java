package com.captainecho.captainecho.diagnosis.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.diagnosis.application.DiagnosisService;
import com.captainecho.captainecho.diagnosis.application.command.StartInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.presentation.request.StartInitialDiagnosisRequest;
import com.captainecho.captainecho.diagnosis.presentation.response.StartInitialDiagnosisResponse;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Diagnosis", description = "진단 관련 API")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    /**
     * 초기 진단 시작
     * POST /api/student/{student-id}/diagnosis/start
     */
    @PostMapping("/{studentId}/diagnosis/start")
    @ApiResponse(responseCode = "200", description = "진단 시작 성공")
    @ApiResponse(responseCode = "400", description = "이미 진행 중인 진단 세션이 있습니다")
    @ApiResponse(responseCode = "403", description = "해당 학생에 대한 접근 권한이 없습니다")
    @ApiResponse(responseCode = "404", description = "학생을 찾을 수 없습니다")
    public ResponseEntity<StartInitialDiagnosisResponse> startInitialDiagnosis(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody StartInitialDiagnosisRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        StartInitialDiagnosisCommand command = new StartInitialDiagnosisCommand(studentId, protectorId);
        StartInitialDiagnosisResult result = diagnosisService.startInitialDiagnosis(command);
        StartInitialDiagnosisResponse response = StartInitialDiagnosisResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
