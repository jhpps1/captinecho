package com.captainecho.captainecho.interest.application.result;

import com.captainecho.captainecho.interest.domain.MajorInterest;

import java.util.List;

public record MajorInterestResult(
        List<MajorInterestInfo> majorInterests
) {
    public static MajorInterestResult from(List<MajorInterest> majorInterests) {
        List<MajorInterestInfo> majorInterestInfos = majorInterests.stream()
                .map(MajorInterestInfo::from)
                .toList();
        return new MajorInterestResult(majorInterestInfos);
    }

    public record MajorInterestInfo(
            Short majorInterestId,
            String majorInterestName
    ) {
        public static MajorInterestInfo from(MajorInterest majorInterest) {
            return new MajorInterestInfo(
                    majorInterest.getMajorInterestId(),
                    majorInterest.getMajorInterestName()
            );
        }
    }
}
