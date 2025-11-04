package com.captainecho.captainecho.adventure.persistence;

import com.captainecho.captainecho.adventure.domain.AdventureType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdventureTypeRepository extends JpaRepository<AdventureType, Integer> {
}
