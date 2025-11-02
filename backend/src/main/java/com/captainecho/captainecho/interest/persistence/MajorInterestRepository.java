package com.captainecho.captainecho.interest.persistence;

import com.captainecho.captainecho.interest.domain.MajorInterest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MajorInterestRepository extends JpaRepository<MajorInterest, Short> {
}
