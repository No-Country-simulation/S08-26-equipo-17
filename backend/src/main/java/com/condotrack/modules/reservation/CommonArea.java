package com.condotrack.modules.reservation;

import com.condotrack.modules.building.Building;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.UUID;

/** An amenity (party hall, barbecue area, gym) available for booking. */
@Entity
@Table(name = "common_areas")
public class CommonArea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity = 10;

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime = LocalTime.of(8, 0);

    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime = LocalTime.of(22, 0);

    @Column(name = "rules_text")
    private String rulesText;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected CommonArea() {}

    public UUID getId() { return id; }
    public Building getBuilding() { return building; }
    public String getName() { return name; }
    public int getMaxCapacity() { return maxCapacity; }
    public LocalTime getOpenTime() { return openTime; }
    public LocalTime getCloseTime() { return closeTime; }
    public String getRulesText() { return rulesText; }
    public boolean isActive() { return active; }
}
