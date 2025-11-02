package com.captainecho.captainecho.interest.application;

import com.captainecho.captainecho.interest.application.result.MajorInterestResult;
import com.captainecho.captainecho.interest.domain.MajorInterest;
import com.captainecho.captainecho.interest.persistence.MajorInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MajorInterestService {

    private final MajorInterestRepository majorInterestRepository;

    public MajorInterestResult getMajorInterests() {
        List<MajorInterest> majorInterests = majorInterestRepository.findAll();
        return MajorInterestResult.from(majorInterests);
    }
}
