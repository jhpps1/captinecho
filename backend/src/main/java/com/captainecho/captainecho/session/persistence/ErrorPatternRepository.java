package com.captainecho.captainecho.session.persistence;

import com.captainecho.captainecho.session.domain.ErrorPattern;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErrorPatternRepository extends JpaRepository<ErrorPattern, Integer> {
}
