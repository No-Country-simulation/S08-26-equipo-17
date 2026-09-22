package com.condotrack.modules.access;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database queries for visitor authorizations. */
public interface AccessAuthorizationRepository extends JpaRepository<AccessAuthorization, UUID> {
    Optional<AccessAuthorization> findByTokenCode(String tokenCode);
    List<AccessAuthorization> findByUnitIdOrderByCreatedAtDesc(UUID unitId);
}
