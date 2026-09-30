package com.condotrack.modules.reservation;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Request and response objects for the reservations API. */
public class ReservationDtos {

    public record CommonAreaResponse(
        UUID id,
        UUID buildingId,
        String buildingName,
        String name,
        int maxCapacity,
        LocalTime openTime,
        LocalTime closeTime,
        String rulesText,
        boolean active
    ) {
        public CommonAreaResponse(UUID id, UUID buildingId, String buildingName,
                                  String name, int maxCapacity,
                                  LocalTime openTime, LocalTime closeTime,
                                  String rulesText) {
            this(id, buildingId, buildingName, name, maxCapacity, openTime, closeTime, rulesText, true);
        }

        @JsonProperty("isActive")
        public boolean getIsActive() {
            return active;
        }

        public boolean isActive() {
            return active;
        }

        static CommonAreaResponse from(CommonArea a) {
            return new CommonAreaResponse(a.getId(), a.getBuilding().getId(),
                a.getBuilding().getName(), a.getName(), a.getMaxCapacity(),
                a.getOpenTime(), a.getCloseTime(), a.getRulesText(), a.isActive());
        }
    }

    public record CreateCommonAreaRequest(
        @NotNull UUID buildingId,
        @NotBlank String name,
        Integer maxCapacity,
        LocalTime openTime,
        LocalTime closeTime,
        String rulesText
    ) {}

    public record UpdateCommonAreaRequest(
        String name,
        Integer maxCapacity,
        LocalTime openTime,
        LocalTime closeTime,
        String rulesText,
        @JsonAlias({"active", "isActive"})
        Boolean isActive
    ) {}

    public record CreateReservationRequest(
        @NotNull UUID commonAreaId,
        @NotNull UUID unitId,
        @NotNull @Future OffsetDateTime startTime,
        @NotNull @Future OffsetDateTime endTime
    ) {}

    public record ReservationResponse(UUID id, UUID commonAreaId, String commonAreaName,
                                      UUID unitId, String unitNumber,
                                      OffsetDateTime startTime, OffsetDateTime endTime,
                                      String status, OffsetDateTime createdAt) {
        static ReservationResponse from(Reservation r) {
            return new ReservationResponse(r.getId(),
                r.getCommonArea().getId(), r.getCommonArea().getName(),
                r.getUnit().getId(), r.getUnit().getNumberCode(),
                r.getStartTime(), r.getEndTime(),
                r.getStatus().name(), r.getCreatedAt());
        }
    }
}
