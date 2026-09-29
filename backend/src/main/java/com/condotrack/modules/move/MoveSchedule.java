package com.condotrack.modules.move;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** A move-in or move-out shift request submitted by a resident and reviewed by admin. */
@Entity
@Table(name = "move_schedules")
public class MoveSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "move_type", nullable = false, length = 10)
    private MoveType moveType;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MoveShift shift;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MoveStatus status = MoveStatus.REQUESTED;

    @Column(name = "admin_notes")
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected MoveSchedule() {}

    public MoveSchedule(Unit unit, User user, MoveType moveType, LocalDate scheduledDate, MoveShift shift) {
        this.unit = unit;
        this.user = user;
        this.moveType = moveType;
        this.scheduledDate = scheduledDate;
        this.shift = shift;
    }

    public void approve(String notes) {
        this.status = MoveStatus.APPROVED;
        this.adminNotes = notes;
    }

    public void reject(String notes) {
        this.status = MoveStatus.REJECTED;
        this.adminNotes = notes;
    }

    public UUID getId() { return id; }
    public Unit getUnit() { return unit; }
    public User getUser() { return user; }
    public MoveType getMoveType() { return moveType; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public MoveShift getShift() { return shift; }
    public MoveStatus getStatus() { return status; }
    public String getAdminNotes() { return adminNotes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
