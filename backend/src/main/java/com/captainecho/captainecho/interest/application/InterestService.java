package com.captainecho.captainecho.interest.application;

import com.captainecho.captainecho.interest.application.command.GetSubInterestsCommand;
import com.captainecho.captainecho.interest.application.result.GetMajorInterestsResult;
import com.captainecho.captainecho.interest.application.result.GetSubInterestsResult;
import com.captainecho.captainecho.interest.domain.MajorInterest;
import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.interest.persistence.MajorInterestRepository;
import com.captainecho.captainecho.interest.persistence.SubInterestRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class InterestService {

    private final MajorInterestRepository majorInterestRepository;
    private final SubInterestRepository subInterestRepository;

    public GetMajorInterestsResult getMajorInterests() {
        List<MajorInterest> majorInterests = majorInterestRepository.findAll();
        return GetMajorInterestsResult.from(majorInterests);
    }

    public GetSubInterestsResult getSubInterests(GetSubInterestsCommand command) {
        List<SubInterest> subInterests = subInterestRepository.findByMajorInterest_MajorInterestId(command.majorInterestId());
        return GetSubInterestsResult.from(command.majorInterestId(), subInterests);
    }
}
