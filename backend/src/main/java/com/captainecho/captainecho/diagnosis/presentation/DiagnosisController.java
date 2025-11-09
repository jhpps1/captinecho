package com.captainecho.captainecho.diagnosis.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.diagnosis.application.DiagnosisService;
import com.captainecho.captainecho.diagnosis.application.command.EndInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.StartInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.SubmitDiagnosisResultCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.GetDiagnosisResultResult;
import com.captainecho.captainecho.diagnosis.application.result.GetInitialDiagnosisProblemsResult;
import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.SubmitDiagnosisResultResult;
import com.captainecho.captainecho.diagnosis.presentation.request.StartInitialDiagnosisRequest;
import com.captainecho.captainecho.diagnosis.presentation.request.SubmitDiagnosisResultRequest;
import com.captainecho.captainecho.diagnosis.presentation.response.EndInitialDiagnosisResponse;
import com.captainecho.captainecho.diagnosis.presentation.response.GetDiagnosisResultResponse;
import com.captainecho.captainecho.diagnosis.presentation.response.GetInitialDiagnosisProblemsResponse;
import com.captainecho.captainecho.diagnosis.presentation.response.StartInitialDiagnosisResponse;
import com.captainecho.captainecho.diagnosis.presentation.response.SubmitDiagnosisResultResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
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
    public ResponseEntity<StartInitialDiagnosisResponse> startInitialDiagnosis(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody StartInitialDiagnosisRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

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
    public ResponseEntity<EndInitialDiagnosisResponse> endInitialDiagnosis(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        EndInitialDiagnosisCommand command = new EndInitialDiagnosisCommand(studentId, protectorId);
        EndInitialDiagnosisResult result = diagnosisService.endInitialDiagnosis(command);
        EndInitialDiagnosisResponse response = EndInitialDiagnosisResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 초기 진단 문제 조회
     * GET /api/student/{student-id}/diagnosis/initial/problems
     */
    @GetMapping("/{studentId}/diagnosis/initial/problems")
    public ResponseEntity<GetInitialDiagnosisProblemsResponse> getInitialDiagnosisProblems(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetInitialDiagnosisProblemsResult result = diagnosisService.getInitialDiagnosisProblems(studentId, protectorId);
        GetInitialDiagnosisProblemsResponse response = GetInitialDiagnosisProblemsResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 초기 진단 답변 제출
     * POST /api/student/{student-id}/diagnosis/result
     */
    @PostMapping("/{studentId}/diagnosis/result")
    public ResponseEntity<SubmitDiagnosisResultResponse> submitDiagnosisResult(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody SubmitDiagnosisResultRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        SubmitDiagnosisResultCommand command = request.toCommand(studentId, protectorId);
        SubmitDiagnosisResultResult result = diagnosisService.submitDiagnosisResult(command);
        SubmitDiagnosisResultResponse response = SubmitDiagnosisResultResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 초기 진단 결과 조회
     * GET /api/student/{student-id}/diagnosis/result
     */
    @GetMapping("/{studentId}/diagnosis/result")
    public ResponseEntity<GetDiagnosisResultResponse> getDiagnosisResult(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetDiagnosisResultResult result = diagnosisService.getDiagnosisResult(studentId, protectorId);
        GetDiagnosisResultResponse response = GetDiagnosisResultResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
