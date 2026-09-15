package com.condotrack.modules.access;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Stores a temporary permission for one visitor to enter a unit. */
@Entity
@Table(name = "access_authorizations")
public class AccessAuthorization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(name = "visitor_name", nullable = false, length = 120)
    private String visitorName;

    @Column(name = "visitor_document", length = 30)
    private String visitorDocument;

    @Column(name = "token_code", nullable = false, unique = true, length = 64)
    private String tokenCode;

    @Column(name = "valid_from", nullable = false)
    private OffsetDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private OffsetDateTime validUntil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthorizationStatus status = AuthorizationStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected AccessAuthorization() {}

    public AccessAuthorization(Unit unit, User createdBy, String visitorName, String visitorDocument,
                               String tokenCode, OffsetDateTime validFrom, OffsetDateTime validUntil) {
        this.unit = unit;
        this.createdBy = createdBy;
        this.visitorName = visitorName;
        this.visitorDocument = visitorDocument;
        this.tokenCode = tokenCode;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
    }

    /** Changes the authorization state after a successful entry. */
    public void markUsed() { this.status = AuthorizationStatus.USED; }

    /** Changes the authorization state when its validity window has ended. */
    public void markExpired() { this.status = AuthorizationStatus.EXPIRED; }

    public UUID getId() { return id; }
    public Unit getUnit() { return unit; }
    public User getCreatedBy() { return createdBy; }
    public String getVisitorName() { return visitorName; }
    public String getVisitorDocument() { return visitorDocument; }
    public String getTokenCode() { return tokenCode; }
    public OffsetDateTime getValidFrom() { return validFrom; }
    public OffsetDateTime getValidUntil() { return validUntil; }
    public AuthorizationStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
