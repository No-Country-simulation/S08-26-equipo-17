package com.condotrack.modules.access;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Records one visitor entry or exit and the operator who checked it. */
@Entity
@Table(name = "access_logs")
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_id")
    private AccessAuthorization authorization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "visitor_name", nullable = false, length = 120)
    private String visitorName;

    @Column(name = "visitor_document", length = 30)
    private String visitorDocument;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AccessDirection direction = AccessDirection.ENTRY;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checked_by_user_id", nullable = false)
    private User checkedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    protected AccessLog() {}

    public AccessLog(AccessAuthorization authorization, Unit unit, String visitorName,
                     String visitorDocument, AccessDirection direction, User checkedBy, String notes) {
        this.authorization = authorization;
        this.unit = unit;
        this.visitorName = visitorName;
        this.visitorDocument = visitorDocument;
        this.direction = direction != null ? direction : AccessDirection.ENTRY;
        this.checkedBy = checkedBy;
        this.notes = notes;
    }

    /** Records one visitor entry or exit and the operator who checked it. */
    public UUID getId() { return id; }
    public AccessAuthorization getAuthorization() { return authorization; }
    public Unit getUnit() { return unit; }
    public String getVisitorName() { return visitorName; }
    public String getVisitorDocument() { return visitorDocument; }
    public AccessDirection getDirection() { return direction; }
    public User getCheckedBy() { return checkedBy; }
    public String getNotes() { return notes; }
    public OffsetDateTime getTimestamp() { return timestamp; }
}
