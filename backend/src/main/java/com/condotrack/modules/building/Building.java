package com.condotrack.modules.building;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

// A building (residential or commercial complex) that contains many units.
// Example: "Sunset Towers, 123 Main St" with 40 units.
@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "total_units", nullable = false)
    private int totalUnits = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected Building() {}

    public Building(String name, String address, int totalUnits) {
        this.name = name;
        this.address = address;
        this.totalUnits = totalUnits;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public int getTotalUnits() { return totalUnits; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
