package com.condotrack.modules.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<IncidentTicket, UUID> {
    Page<IncidentTicket> findByOrderByCreatedAtDesc(Pageable pageable);
    List<IncidentTicket> findByUnitIdAndStatusNotOrderByCreatedAtDesc(UUID unitId, IncidentStatus status);
}
