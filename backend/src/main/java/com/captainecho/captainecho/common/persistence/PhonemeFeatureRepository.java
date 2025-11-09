package com.captainecho.captainecho.common.persistence;

import com.captainecho.captainecho.common.domain.PhonemeFeature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhonemeFeatureRepository extends JpaRepository<PhonemeFeature, Character> {
}
