package com.captainecho.captainecho.interest.presentation.response;

import com.captainecho.captainecho.interest.application.result.GetMajorInterestsResult;

import java.util.List;

public record GetMajorInterestsResponse(
        List<MajorInterestInfo> majorInterests
) {
    public static GetMajorInterestsResponse from(GetMajorInterestsResult result) {
        List<MajorInterestInfo> majorInterestInfos = result.majorInterests().stream()
                .map(info -> new MajorInterestInfo(info.majorInterestId(), info.majorInterestName()))
                .toList();
        return new GetMajorInterestsResponse(majorInterestInfos);
    }

    public record MajorInterestInfo(
            Short majorInterestId,
            String majorInterestName
    ) {
    }
}
