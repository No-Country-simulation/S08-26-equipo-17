package com.condotrack.modules.reservation;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/** A time-slot booking for a common area made by a resident. */
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "common_area_id", nullable = false)
    private CommonArea commonArea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected Reservation() {}

    public Reservation(CommonArea commonArea, Unit unit, User user,
                       OffsetDateTime startTime, OffsetDateTime endTime) {
        this.commonArea = commonArea;
        this.unit = unit;
        this.user = user;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public void cancel() { this.status = ReservationStatus.CANCELLED; }

    public UUID getId() { return id; }
    public CommonArea getCommonArea() { return commonArea; }
    public Unit getUnit() { return unit; }
    public User getUser() { return user; }
    public OffsetDateTime getStartTime() { return startTime; }
    public OffsetDateTime getEndTime() { return endTime; }
    public ReservationStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
