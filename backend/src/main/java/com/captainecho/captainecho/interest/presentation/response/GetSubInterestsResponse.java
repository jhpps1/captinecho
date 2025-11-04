package com.captainecho.captainecho.interest.presentation.response;

import com.captainecho.captainecho.interest.application.result.GetSubInterestsResult;

import java.util.List;

public record GetSubInterestsResponse(
        Short majorInterestId,
        List<SubInterestInfo> subInterests
) {
    public static GetSubInterestsResponse from(GetSubInterestsResult result) {
        List<SubInterestInfo> subInterestInfos = result.subInterests().stream()
                .map(info -> new SubInterestInfo(info.subInterestId(), info.subInterestName()))
                .toList();
        return new GetSubInterestsResponse(result.majorInterestId(), subInterestInfos);
    }

    public record SubInterestInfo(
            Short subInterestId,
            String subInterestName
    ) {
    }
}
