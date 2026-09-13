package com.condotrack.modules.building;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "units", uniqueConstraints = {
    @UniqueConstraint(name = "uq_building_unit", columnNames = {"building_id", "block", "number_code"})
})
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(length = 50)
    private String block;

    @Column(name = "number_code", nullable = false, length = 20)
    private String numberCode;

    @Column
    private Integer floor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected Unit() {}

    public Unit(Building building, String block, String numberCode, Integer floor) {
        this.building = building;
        this.block = block;
        this.numberCode = numberCode;
        this.floor = floor;
    }

    public UUID getId() { return id; }
    public Building getBuilding() { return building; }
    public String getBlock() { return block; }
    public String getNumberCode() { return numberCode; }
    public Integer getFloor() { return floor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
