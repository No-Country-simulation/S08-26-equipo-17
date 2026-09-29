package com.condotrack.modules.overview;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class UnitOverviewDtos {

    public record UnitSummary(
        UUID id,
        String buildingName,
        String block,
        String numberCode,
        Integer floor
    ) {}

    public record ResidentSummary(
        UUID userId,
        String name,
        String phone,
        String relationshipType
    ) {}

    public record PendingPackageSummary(
        UUID id,
        String carrierName,
        String trackingCode,
        OffsetDateTime receivedAt
    ) {}

    public record RecentAccessSummary(
        String visitorName,
        String visitorDocument,
        String direction,
        String checkedByOperator,
        OffsetDateTime timestamp
    ) {}

    public record UpcomingReservationSummary(
        String commonAreaName,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        String status
    ) {}

    public record ScheduledMoveSummary(
        String moveType,
        LocalDate scheduledDate,
        String shift,
        String status
    ) {}

    public record OpenIncidentSummary(
        UUID id,
        String title,
        String priority,
        String status,
        OffsetDateTime createdAt
    ) {}

    public record RecentAuditSummary(
        String module,
        String action,
        String description,
        OffsetDateTime timestamp
    ) {}

    public record UnitOverviewResponse(
        UnitSummary unit,
        List<ResidentSummary> residents,
        List<PendingPackageSummary> pendingPackages,
        List<RecentAccessSummary> recentAccesses,
        List<UpcomingReservationSummary> upcomingReservations,
        ScheduledMoveSummary scheduledMove,
        List<OpenIncidentSummary> openIncidents,
        List<RecentAuditSummary> recentAuditTimeline
    ) {}
}
