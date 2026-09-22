package com.condotrack.modules.audit;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Stores an immutable record of an important business operation. */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "building_id", nullable = false)
    private UUID buildingId;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditModule module;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson = "{}";

    @Column(nullable = false, updatable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    protected AuditLog() {}

    public AuditLog(UUID buildingId, UUID unitId, UUID userId, AuditModule module,
                    String action, String description, String metadataJson) {
        this.buildingId = buildingId;
        this.unitId = unitId;
        this.userId = userId;
        this.module = module;
        this.action = action;
        this.description = description;
        this.metadataJson = metadataJson != null ? metadataJson : "{}";
    }

    public UUID getId() { return id; }
    public UUID getBuildingId() { return buildingId; }
    public UUID getUnitId() { return unitId; }
    public UUID getUserId() { return userId; }
    public AuditModule getModule() { return module; }
    public String getAction() { return action; }
    public String getDescription() { return description; }
    public String getMetadataJson() { return metadataJson; }
    public OffsetDateTime getTimestamp() { return timestamp; }
}
