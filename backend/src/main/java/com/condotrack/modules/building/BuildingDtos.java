package com.condotrack.modules.building;

import java.time.OffsetDateTime;
import java.util.UUID;

public class BuildingDtos {

    public record BuildingRequest(String name, String address, int totalUnits) {}

    public record BuildingResponse(UUID id, String name, String address, int totalUnits, OffsetDateTime createdAt) {
        public static BuildingResponse from(Building b) {
            return new BuildingResponse(b.getId(), b.getName(), b.getAddress(), b.getTotalUnits(), b.getCreatedAt());
        }
    }

    public record UnitRequest(UUID buildingId, String block, String numberCode, Integer floor) {}

    public record UnitResponse(UUID id, UUID buildingId, String block, String numberCode, Integer floor, OffsetDateTime createdAt) {
        public static UnitResponse from(Unit u) {
            return new UnitResponse(u.getId(), u.getBuilding().getId(), u.getBlock(), u.getNumberCode(), u.getFloor(), u.getCreatedAt());
        }
    }
}
