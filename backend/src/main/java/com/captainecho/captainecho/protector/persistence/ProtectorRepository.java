package com.captainecho.captainecho.protector.persistence;

import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.domain.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProtectorRepository extends JpaRepository<Protector, Long> {

    Optional<Protector> findByProviderAndSocialId(Provider provider, String socialId);

    boolean existsByProviderAndSocialId(Provider provider, String socialId);
}
