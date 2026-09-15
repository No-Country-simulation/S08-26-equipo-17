package com.condotrack.modules.audit;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Writes and reads the audit trail used to track operational changes. */
@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    /** Saves an audit event in its own transaction. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID buildingId, UUID unitId, UUID userId, AuditModule module,
                    String action, String description, String metadataJson) {
        repository.save(new AuditLog(buildingId, unitId, userId, module, action, description, metadataJson));
    }

    /** Returns the newest audit events, optionally limited to one unit. */
    @Transactional(readOnly = true)
    public Page<AuditResponse> list(UUID unitId, Pageable pageable) {
        Page<AuditLog> page = unitId != null
            ? repository.findByUnitIdOrderByTimestampDesc(unitId, pageable)
            : repository.findAllByOrderByTimestampDesc(pageable);
        return page.map(AuditResponse::from);
    }

    public record AuditResponse(UUID id, UUID buildingId, UUID unitId, UUID userId,
                                String module, String action, String description,
                                java.time.OffsetDateTime timestamp) {
        static AuditResponse from(AuditLog a) {
            return new AuditResponse(a.getId(), a.getBuildingId(), a.getUnitId(), a.getUserId(),
                a.getModule().name(), a.getAction(), a.getDescription(), a.getTimestamp());
        }
    }
}
