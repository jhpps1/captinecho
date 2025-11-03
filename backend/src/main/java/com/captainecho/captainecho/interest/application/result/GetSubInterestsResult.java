package com.captainecho.captainecho.interest.application.result;

import com.captainecho.captainecho.interest.domain.SubInterest;

import java.util.List;

public record GetSubInterestsResult(
        Short majorInterestId,
        List<SubInterestInfo> subInterests
) {
    public static GetSubInterestsResult from(Short majorInterestId, List<SubInterest> subInterests) {
        List<SubInterestInfo> subInterestInfos = subInterests.stream()
                .map(SubInterestInfo::from)
                .toList();
        return new GetSubInterestsResult(majorInterestId, subInterestInfos);
    }

    public record SubInterestInfo(
            Short subInterestId,
            String subInterestName
    ) {
        public static SubInterestInfo from(SubInterest subInterest) {
            return new SubInterestInfo(
                    subInterest.getSubInterestId(),
                    subInterest.getSmallInterestName()
            );
        }
    }
}
