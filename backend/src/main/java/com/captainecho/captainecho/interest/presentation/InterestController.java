package com.captainecho.captainecho.interest.presentation;

import com.captainecho.captainecho.interest.application.InterestService;
import com.captainecho.captainecho.interest.application.result.GetMajorInterestsResult;
import com.captainecho.captainecho.interest.application.result.GetSubInterestsResult;
import com.captainecho.captainecho.interest.presentation.request.GetSubInterestsRequest;
import com.captainecho.captainecho.interest.presentation.response.GetMajorInterestsResponse;
import com.captainecho.captainecho.interest.presentation.response.GetSubInterestsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interest")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;

    @GetMapping("/major")
    public ResponseEntity<GetMajorInterestsResponse> getMajorInterests() {
        GetMajorInterestsResult result = interestService.getMajorInterests();
        GetMajorInterestsResponse response = GetMajorInterestsResponse.from(result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sub")
    public ResponseEntity<GetSubInterestsResponse> getSubInterests(@Valid @ModelAttribute GetSubInterestsRequest request) {
        GetSubInterestsResult result = interestService.getSubInterests(request.toCommand());
        GetSubInterestsResponse response = GetSubInterestsResponse.from(result);
        return ResponseEntity.ok(response);
    }
}
