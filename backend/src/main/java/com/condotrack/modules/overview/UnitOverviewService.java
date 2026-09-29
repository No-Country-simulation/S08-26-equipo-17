package com.condotrack.modules.overview;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.access.AccessLog;
import com.condotrack.modules.access.AccessLogRepository;
import com.condotrack.modules.audit.AuditLog;
import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentRepository;
import com.condotrack.modules.incident.IncidentStatus;
import com.condotrack.modules.incident.IncidentTicket;
import com.condotrack.modules.move.MoveRepository;
import com.condotrack.modules.move.MoveSchedule;
import com.condotrack.modules.overview.UnitOverviewDtos.*;
import com.condotrack.modules.parcel.PackageDelivery;
import com.condotrack.modules.parcel.PackageDeliveryRepository;
import com.condotrack.modules.parcel.PackageStatus;
import com.condotrack.modules.reservation.Reservation;
import com.condotrack.modules.reservation.ReservationRepository;
import com.condotrack.modules.resident.UserUnit;
import com.condotrack.modules.resident.UserUnitRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UnitOverviewService {

    private final UnitRepository unitRepository;
    private final UserUnitRepository userUnitRepository;
    private final PackageDeliveryRepository packageDeliveryRepository;
    private final AccessLogRepository accessLogRepository;
    private final ReservationRepository reservationRepository;
    private final MoveRepository moveRepository;
    private final IncidentRepository incidentRepository;
    private final AuditLogRepository auditLogRepository;

    public UnitOverviewService(
            UnitRepository unitRepository,
            UserUnitRepository userUnitRepository,
            PackageDeliveryRepository packageDeliveryRepository,
            AccessLogRepository accessLogRepository,
            ReservationRepository reservationRepository,
            MoveRepository moveRepository,
            IncidentRepository incidentRepository,
            AuditLogRepository auditLogRepository) {
        this.unitRepository = unitRepository;
        this.userUnitRepository = userUnitRepository;
        this.packageDeliveryRepository = packageDeliveryRepository;
        this.accessLogRepository = accessLogRepository;
        this.reservationRepository = reservationRepository;
        this.moveRepository = moveRepository;
        this.incidentRepository = incidentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public UnitOverviewResponse getOverview(UUID unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));

        UnitSummary unitSummary = new UnitSummary(
                unit.getId(),
                unit.getBuilding().getName(),
                unit.getBlock(),
                unit.getNumberCode(),
                unit.getFloor()
        );

        List<ResidentSummary> residents = userUnitRepository.findResidentsByUnitId(unitId).stream()
                .map(uu -> new ResidentSummary(
                        uu.getUser().getId(),
                        uu.getUser().getName(),
                        uu.getUser().getPhone(),
                        uu.getRelationshipType() != null ? uu.getRelationshipType().name() : "TENANT"
                ))
                .toList();

        List<PendingPackageSummary> pendingPackages = packageDeliveryRepository.findByUnitIdOrderByReceivedAtDesc(unitId).stream()
                .filter(p -> p.getStatus() == PackageStatus.PENDING_PICKUP)
                .map(p -> new PendingPackageSummary(
                        p.getId(),
                        p.getCarrierName(),
                        p.getTrackingCode(),
                        p.getReceivedAt()
                ))
                .toList();

        List<RecentAccessSummary> recentAccesses = accessLogRepository.findByUnitIdOrderByTimestampDesc(unitId).stream()
                .limit(5)
                .map(a -> new RecentAccessSummary(
                        a.getVisitorName(),
                        a.getVisitorDocument(),
                        a.getDirection() != null ? a.getDirection().name() : "ENTRY",
                        a.getCheckedBy() != null ? a.getCheckedBy().getName() : "Portaria",
                        a.getTimestamp()
                ))
                .toList();

        OffsetDateTime now = OffsetDateTime.now();
        List<UpcomingReservationSummary> upcomingReservations = reservationRepository.findByUnitIdOrderByStartTimeDesc(unitId).stream()
                .filter(r -> r.getEndTime().isAfter(now))
                .map(r -> new UpcomingReservationSummary(
                        r.getCommonArea().getName(),
                        r.getStartTime(),
                        r.getEndTime(),
                        r.getStatus() != null ? r.getStatus().name() : "CONFIRMED"
                ))
                .toList();

        List<MoveSchedule> moves = moveRepository.findByUnitIdOrderByScheduledDateDesc(unitId);
        ScheduledMoveSummary scheduledMove = moves.stream()
                .findFirst()
                .map(m -> new ScheduledMoveSummary(
                        m.getMoveType() != null ? m.getMoveType().name() : "IN",
                        m.getScheduledDate(),
                        m.getShift() != null ? m.getShift().name() : "MORNING",
                        m.getStatus() != null ? m.getStatus().name() : "REQUESTED"
                ))
                .orElse(null);

        List<OpenIncidentSummary> openIncidents = incidentRepository
                .findByUnitIdAndStatusNotOrderByCreatedAtDesc(unitId, IncidentStatus.CLOSED).stream()
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED)
                .map(i -> new OpenIncidentSummary(
                        i.getId(),
                        i.getTitle(),
                        i.getPriority() != null ? i.getPriority().name() : "MEDIUM",
                        i.getStatus() != null ? i.getStatus().name() : "OPEN",
                        i.getCreatedAt()
                ))
                .toList();

        List<RecentAuditSummary> recentAuditTimeline = auditLogRepository
                .findByUnitIdOrderByTimestampDesc(unitId, PageRequest.of(0, 10))
                .map(a -> new RecentAuditSummary(
                        a.getModule() != null ? a.getModule().name() : "GENERAL",
                        a.getAction(),
                        a.getDescription(),
                        a.getTimestamp()
                ))
                .getContent();

        return new UnitOverviewResponse(
                unitSummary,
                residents,
                pendingPackages,
                recentAccesses,
                upcomingReservations,
                scheduledMove,
                openIncidents,
                recentAuditTimeline
        );
    }
}
