package com.captainecho.captainecho.interest.presentation.response;

import com.captainecho.captainecho.interest.application.result.MajorInterestResult;

import java.util.List;

public record MajorInterestResponse(
        List<MajorInterestInfo> majorInterests
) {
    public static MajorInterestResponse from(MajorInterestResult result) {
        List<MajorInterestInfo> majorInterestInfos = result.majorInterests().stream()
                .map(info -> new MajorInterestInfo(info.majorInterestId(), info.majorInterestName()))
                .toList();
        return new MajorInterestResponse(majorInterestInfos);
    }

    public record MajorInterestInfo(
            Short majorInterestId,
            String majorInterestName
    ) {
    }
}
