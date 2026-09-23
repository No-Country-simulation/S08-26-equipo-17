package com.condotrack.modules.move;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Request and response objects for the move schedules API (US-07). */
public class MoveDtos {

    public record CreateMoveRequest(
        @NotNull UUID unitId,
        @NotNull MoveType moveType,
        @NotNull @Future LocalDate scheduledDate,
        @NotNull MoveShift shift
    ) {}

    public record ReviewMoveRequest(
        @NotNull MoveStatus status,
        String adminNotes
    ) {}

    public record MoveResponse(
        UUID id,
        UUID unitId,
        String unitNumber,
        String block,
        UUID userId,
        String userName,
        String moveType,
        LocalDate scheduledDate,
        String shift,
        String status,
        String adminNotes,
        OffsetDateTime createdAt
    ) {
        static MoveResponse from(MoveSchedule m) {
            return new MoveResponse(
                m.getId(),
                m.getUnit().getId(),
                m.getUnit().getNumberCode(),
                m.getUnit().getBlock(),
                m.getUser().getId(),
                m.getUser().getName(),
                m.getMoveType().name(),
                m.getScheduledDate(),
                m.getShift().name(),
                m.getStatus().name(),
                m.getAdminNotes(),
                m.getCreatedAt()
            );
        }
    }
}
