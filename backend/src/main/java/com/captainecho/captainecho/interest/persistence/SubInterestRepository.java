package com.captainecho.captainecho.interest.persistence;

import com.captainecho.captainecho.interest.domain.SubInterest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubInterestRepository extends JpaRepository<SubInterest, Short> {

    List<SubInterest> findByMajorInterest_MajorInterestId(Short majorInterestId);
}
