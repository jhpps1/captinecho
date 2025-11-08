package com.captainecho.captainecho.session.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.session.application.SessionService;
import com.captainecho.captainecho.student.application.command.RecordAnswerCommand;
import com.captainecho.captainecho.student.application.result.RecordAnswerResult;
import com.captainecho.captainecho.student.presentation.request.RecordAnswerRequest;
import com.captainecho.captainecho.student.presentation.response.RecordAnswerResponse;
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
@Tag(name = "Session", description = "학습 세션 관련 API")
public class SessionController {

    private final SessionService sessionService;

    /**
     * 정답/오답 기록
     * POST /api/student/{student-id}/session/correct
     */
    @PostMapping("/{studentId}/session/correct")
    public ResponseEntity<RecordAnswerResponse> recordAnswer(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody RecordAnswerRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        RecordAnswerCommand command = request.toCommand(studentId, protectorId);
        RecordAnswerResult result = sessionService.recordAnswer(command);
        RecordAnswerResponse response = RecordAnswerResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
