package com.captainecho.captainecho.diagnosis.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.diagnosis.application.DiagnosisService;
import com.captainecho.captainecho.diagnosis.application.command.EndDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.StartInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.presentation.request.StartInitialDiagnosisRequest;
import com.captainecho.captainecho.diagnosis.presentation.response.EndDiagnosisResponse;
import com.captainecho.captainecho.diagnosis.presentation.response.StartInitialDiagnosisResponse;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    /**
     * 초기 진단 시작
     * POST /api/student/{student-id}/diagnosis/start
     */
    @PostMapping("/{studentId}/diagnosis/start")
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

    /**
     * 초기 진단 종료
     * POST /api/student/{student-id}/diagnosis/end
     */
    @PostMapping("/{studentId}/diagnosis/end")
    public ResponseEntity<EndDiagnosisResponse> endDiagnosis(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        EndDiagnosisCommand command = new EndDiagnosisCommand(studentId);
        EndDiagnosisResult result = diagnosisService.endDiagnosis(command);

        EndDiagnosisResponse response = new EndDiagnosisResponse(result.success());

        return ResponseEntity.ok(response);
    }
}
