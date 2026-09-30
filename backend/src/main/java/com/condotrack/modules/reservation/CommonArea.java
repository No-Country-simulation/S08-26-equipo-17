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

    public CommonArea(Building building, String name, int maxCapacity, LocalTime openTime, LocalTime closeTime, String rulesText) {
        this.building = building;
        this.name = name;
        this.maxCapacity = maxCapacity;
        this.openTime = openTime != null ? openTime : LocalTime.of(8, 0);
        this.closeTime = closeTime != null ? closeTime : LocalTime.of(22, 0);
        this.rulesText = rulesText;
        this.active = true;
    }

    public UUID getId() { return id; }
    public Building getBuilding() { return building; }
    public String getName() { return name; }
    public int getMaxCapacity() { return maxCapacity; }
    public LocalTime getOpenTime() { return openTime; }
    public LocalTime getCloseTime() { return closeTime; }
    public String getRulesText() { return rulesText; }
    public boolean isActive() { return active; }

    public void setName(String name) { this.name = name; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
    public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
    public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
    public void setRulesText(String rulesText) { this.rulesText = rulesText; }
    public void setActive(boolean active) { this.active = active; }
    public void deactivate() { this.active = false; }

    public void update(String name, Integer maxCapacity, LocalTime openTime, LocalTime closeTime, String rulesText, Boolean active) {
        if (name != null && !name.isBlank()) this.name = name;
        if (maxCapacity != null && maxCapacity > 0) this.maxCapacity = maxCapacity;
        if (openTime != null) this.openTime = openTime;
        if (closeTime != null) this.closeTime = closeTime;
        if (rulesText != null) this.rulesText = rulesText;
        if (active != null) this.active = active;
    }
}
