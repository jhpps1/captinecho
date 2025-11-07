package com.captainecho.captainecho.protector.presentation.response.persistence;

import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.domain.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProtectorRepository extends JpaRepository<Protector, Integer> {

    Optional<Protector> findByProviderAndSocialId(Provider provider, String socialId);

    boolean existsByProviderAndSocialId(Provider provider, String socialId);
}
