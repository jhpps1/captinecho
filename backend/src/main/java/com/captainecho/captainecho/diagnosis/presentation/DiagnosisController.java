package com.captainecho.captainecho.diagnosis.presentation;

import com.captainecho.captainecho.diagnosis.application.DiagnosisService;
import com.captainecho.captainecho.diagnosis.application.command.EndDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndDiagnosisResult;
import com.captainecho.captainecho.diagnosis.presentation.response.EndDiagnosisResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Diagnosis", description = "초기 진단 API")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping("/{studentId}/diagnosis/end")
    public ResponseEntity<EndDiagnosisResponse> endDiagnosis(
            @PathVariable Integer studentId
    ) {
        EndDiagnosisCommand command = new EndDiagnosisCommand(studentId);
        EndDiagnosisResult result = diagnosisService.endDiagnosis(command);

        EndDiagnosisResponse response = new EndDiagnosisResponse(result.success());

        return ResponseEntity.ok(response);
    }
}
