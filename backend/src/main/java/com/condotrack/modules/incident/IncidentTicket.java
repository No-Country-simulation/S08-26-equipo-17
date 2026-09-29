package com.condotrack.modules.incident;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "incident_tickets")
public class IncidentTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IncidentCategory category = IncidentCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentPriority priority = IncidentPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    protected IncidentTicket() {}

    public IncidentTicket(Building building, Unit unit, User createdBy,
                          String title, String description, String photoUrl,
                          IncidentCategory category, IncidentPriority priority) {
        this.building = building;
        this.unit = unit;
        this.createdBy = createdBy;
        this.title = title;
        this.description = description;
        this.photoUrl = photoUrl;
        this.category = category != null ? category : IncidentCategory.OTHER;
        this.priority = priority != null ? priority : IncidentPriority.MEDIUM;
    }

    public void updateStatus(IncidentStatus newStatus, User assignedTo) {
        this.status = newStatus;
        if (assignedTo != null) this.assignedTo = assignedTo;
        if (newStatus == IncidentStatus.RESOLVED || newStatus == IncidentStatus.CLOSED) {
            this.resolvedAt = OffsetDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public Building getBuilding() { return building; }
    public Unit getUnit() { return unit; }
    public User getCreatedBy() { return createdBy; }
    public User getAssignedTo() { return assignedTo; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getPhotoUrl() { return photoUrl; }
    public IncidentCategory getCategory() { return category; }
    public IncidentPriority getPriority() { return priority; }
    public IncidentStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getResolvedAt() { return resolvedAt; }
}
