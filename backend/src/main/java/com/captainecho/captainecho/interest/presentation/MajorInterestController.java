package com.captainecho.captainecho.interest.presentation;

import com.captainecho.captainecho.interest.application.MajorInterestService;
import com.captainecho.captainecho.interest.application.result.MajorInterestResult;
import com.captainecho.captainecho.interest.presentation.response.MajorInterestResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interest")
@RequiredArgsConstructor
public class MajorInterestController {

    private final MajorInterestService majorInterestService;

    @GetMapping("/major")
    public ResponseEntity<MajorInterestResponse> getMajorInterests() {
        MajorInterestResult result = majorInterestService.getMajorInterests();
        MajorInterestResponse response = MajorInterestResponse.from(result);
        return ResponseEntity.ok(response);
    }
}
