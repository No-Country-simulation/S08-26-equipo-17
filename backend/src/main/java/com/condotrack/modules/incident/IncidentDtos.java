package com.condotrack.modules.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class IncidentDtos {

    public record CreateIncidentRequest(
        @NotNull UUID unitId,
        @NotBlank String title,
        @NotBlank String description,
        String photoUrl,
        IncidentCategory category,
        IncidentPriority priority
    ) {}

    public record UpdateIncidentStatusRequest(
        @NotNull IncidentStatus status,
        UUID assignedToUserId
    ) {}

    public record IncidentResponse(
        UUID id,
        UUID buildingId,
        UUID unitId,
        UUID createdByUserId,
        String createdByName,
        UUID assignedToUserId,
        String assignedToName,
        String title,
        String description,
        String photoUrl,
        String category,
        String priority,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime resolvedAt
    ) {
        static IncidentResponse from(IncidentTicket t) {
            return new IncidentResponse(
                t.getId(),
                t.getBuilding().getId(),
                t.getUnit() != null ? t.getUnit().getId() : null,
                t.getCreatedBy().getId(),
                t.getCreatedBy().getName(),
                t.getAssignedTo() != null ? t.getAssignedTo().getId() : null,
                t.getAssignedTo() != null ? t.getAssignedTo().getName() : null,
                t.getTitle(),
                t.getDescription(),
                t.getPhotoUrl(),
                t.getCategory().name(),
                t.getPriority().name(),
                t.getStatus().name(),
                t.getCreatedAt(),
                t.getResolvedAt()
            );
        }
    }
}
