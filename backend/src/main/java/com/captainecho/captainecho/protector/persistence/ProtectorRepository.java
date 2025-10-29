package com.captainecho.captainecho.protector.persistence;

import com.captainecho.captainecho.protector.domain.Protector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ProtectorRepository extends JpaRepository<Protector, Long> {
    Optional<Protector> findByProviderAndSocialId(String provider, String socialId);

    boolean existsByProviderAndSocialId(String provider, String socialId);
}
