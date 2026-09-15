package com.condotrack.modules.access;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database access for visitor entry and exit records. */
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID> {
    List<AccessLog> findByUnitIdOrderByTimestampDesc(UUID unitId);
}
