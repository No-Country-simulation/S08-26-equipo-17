package com.condotrack.modules.reservation;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.reservation.ReservationDtos.*;
import com.condotrack.modules.resident.UserUnitRepository;
import com.condotrack.modules.notification.NotificationService;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business rules for listing amenities and managing conflict-free bookings. */
@Service
@Transactional(readOnly = true)
public class ReservationService {

    private final CommonAreaRepository commonAreaRepository;
    private final ReservationRepository reservationRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final UserUnitRepository userUnitRepository;
    private final AuditService auditService;
    private final BuildingRepository buildingRepository;
    private final NotificationService notificationService;

    public ReservationService(CommonAreaRepository commonAreaRepository,
                              ReservationRepository reservationRepository,
                              UnitRepository unitRepository,
                              UserRepository userRepository,
                              UserUnitRepository userUnitRepository,
                              AuditService auditService) {
        this(commonAreaRepository, reservationRepository, unitRepository, userRepository, userUnitRepository, auditService, null, null);
    }

    public ReservationService(CommonAreaRepository commonAreaRepository,
                              ReservationRepository reservationRepository,
                              UnitRepository unitRepository,
                              UserRepository userRepository,
                              UserUnitRepository userUnitRepository,
                              AuditService auditService,
                              BuildingRepository buildingRepository) {
        this(commonAreaRepository, reservationRepository, unitRepository, userRepository, userUnitRepository, auditService, buildingRepository, null);
    }

    @Autowired
    public ReservationService(CommonAreaRepository commonAreaRepository,
                              ReservationRepository reservationRepository,
                              UnitRepository unitRepository,
                              UserRepository userRepository,
                              UserUnitRepository userUnitRepository,
                              AuditService auditService,
                              @Autowired(required = false) BuildingRepository buildingRepository,
                              @Autowired(required = false) NotificationService notificationService) {
        this.commonAreaRepository = commonAreaRepository;
        this.reservationRepository = reservationRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.userUnitRepository = userUnitRepository;
        this.auditService = auditService;
        this.buildingRepository = buildingRepository;
        this.notificationService = notificationService;
    }

    /** Lists all active amenities in the building. */
    public List<CommonAreaResponse> listCommonAreas() {
        return commonAreaRepository.findByActiveTrue().stream()
            .map(CommonAreaResponse::from).toList();
    }

    /** Lists confirmed bookings for a common area (availability calendar). */
    public List<ReservationResponse> listByArea(UUID commonAreaId) {
        return reservationRepository
            .findByCommonAreaIdAndStatusOrderByStartTimeAsc(commonAreaId, ReservationStatus.CONFIRMED)
            .stream().map(ReservationResponse::from).toList();
    }

    /**
     * Creates a booking with atomic conflict prevention.
     * Throws {@link ConflictException} (HTTP 409) on overlap.
     */
    @Transactional
    public ReservationResponse create(CreateReservationRequest req) {
        if (!req.endTime().isAfter(req.startTime())) {
            throw new BusinessException("endTime must be after startTime");
        }

        CommonArea area = commonAreaRepository.findByIdForUpdate(req.commonAreaId())
            .orElseThrow(() -> new ResourceNotFoundException("Common area not found: " + req.commonAreaId()));

        User requester = currentUser();
        if (requester.getRole().isResident() && !userUnitRepository.existsByUserIdAndUnitId(requester.getId(), req.unitId())) {
            throw new AccessDeniedException("Morador não possui vínculo com a unidade indicada");
        }

        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));

        if (reservationRepository.existsConflict(area.getId(), req.startTime(), req.endTime())) {
            throw new ConflictException("Time slot already booked for: " + area.getName());
        }

        Reservation reservation = new Reservation(area, unit, requester, req.startTime(), req.endTime());
        reservationRepository.save(reservation);

        auditService.log(unit.getBuilding().getId(), unit.getId(), requester.getId(),
            AuditModule.RESERVATION, "RESERVATION_CREATED",
            "Reservation for " + area.getName() + " from " + req.startTime() + " to " + req.endTime(),
            "{\"commonAreaId\":\"" + area.getId() + "\",\"startTime\":\"" + req.startTime() + "\"}");

        if (notificationService != null && requester != null) {
            notificationService.sendInAppNotification(
                requester,
                "Reserva Confirmada",
                "Sua reserva para " + area.getName() + " das " + req.startTime() + " às " + req.endTime() + " foi confirmada.",
                "RESERVATION"
            );
        }

        return ReservationResponse.from(reservation);
    }

    /** Cancels a confirmed reservation. Only the author or ADMIN may cancel. */
    @Transactional
    public ReservationResponse cancel(UUID id) {
        User requester = currentUser();
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BusinessException("Reservation already cancelled: " + id);
        }

        boolean isOwner = reservation.getUser().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the reservation owner or an admin can cancel it");
        }

        reservation.cancel();

        Unit unit = reservation.getUnit();
        auditService.log(unit.getBuilding().getId(), unit.getId(), requester.getId(),
            AuditModule.RESERVATION, "RESERVATION_CANCELLED",
            "Reservation " + id + " for " + reservation.getCommonArea().getName() + " cancelled",
            "{\"reservationId\":\"" + id + "\"}");

        if (notificationService != null && reservation.getUser() != null) {
            notificationService.sendInAppNotification(
                reservation.getUser(),
                "Reserva Cancelada",
                "Sua reserva para " + reservation.getCommonArea().getName() + " foi cancelada.",
                "RESERVATION"
            );
        }

        return ReservationResponse.from(reservation);
    }

    /** Admin: registers a new common area linked to a building. */
    @Transactional
    public CommonAreaResponse createCommonArea(CreateCommonAreaRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            throw new BusinessException("Common area name cannot be blank");
        }
        Building building = buildingRepository.findById(req.buildingId())
            .orElseThrow(() -> new ResourceNotFoundException("Building not found: " + req.buildingId()));

        LocalTime open = req.openTime() != null ? req.openTime() : LocalTime.of(8, 0);
        LocalTime close = req.closeTime() != null ? req.closeTime() : LocalTime.of(22, 0);
        if (!close.isAfter(open)) {
            throw new BusinessException("closeTime must be after openTime");
        }
        int capacity = req.maxCapacity() != null && req.maxCapacity() > 0 ? req.maxCapacity() : 10;

        CommonArea area = new CommonArea(building, req.name().trim(), capacity, open, close, req.rulesText());
        commonAreaRepository.save(area);

        User admin = currentUser();
        auditService.log(building.getId(), null, admin.getId(),
            AuditModule.RESERVATION, "COMMON_AREA_CREATED",
            "Common area \"" + area.getName() + "\" created by " + admin.getName(),
            "{\"commonAreaId\":\"" + area.getId() + "\",\"name\":\"" + escapeJson(area.getName()) + "\"}");

        return CommonAreaResponse.from(area);
    }

    /** Admin: updates common area info, hours, rules, and active status. */
    @Transactional
    public CommonAreaResponse updateCommonArea(UUID id, UpdateCommonAreaRequest req) {
        CommonArea area = commonAreaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Common area not found: " + id));

        LocalTime newOpen = req.openTime() != null ? req.openTime() : area.getOpenTime();
        LocalTime newClose = req.closeTime() != null ? req.closeTime() : area.getCloseTime();
        if (!newClose.isAfter(newOpen)) {
            throw new BusinessException("closeTime must be after openTime");
        }

        area.update(req.name(), req.maxCapacity(), req.openTime(), req.closeTime(), req.rulesText(), req.isActive());
        commonAreaRepository.save(area);

        User admin = currentUser();
        auditService.log(area.getBuilding().getId(), null, admin.getId(),
            AuditModule.RESERVATION, "COMMON_AREA_UPDATED",
            "Common area \"" + area.getName() + "\" updated by " + admin.getName(),
            "{\"commonAreaId\":\"" + area.getId() + "\",\"name\":\"" + escapeJson(area.getName()) + "\"}");

        return CommonAreaResponse.from(area);
    }

    /** Admin: performs soft-delete setting isActive = false. */
    @Transactional
    public CommonAreaResponse deleteCommonArea(UUID id) {
        CommonArea area = commonAreaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Common area not found: " + id));

        area.deactivate();
        commonAreaRepository.save(area);

        User admin = currentUser();
        auditService.log(area.getBuilding().getId(), null, admin.getId(),
            AuditModule.RESERVATION, "COMMON_AREA_DELETED",
            "Common area \"" + area.getName() + "\" deactivated by " + admin.getName(),
            "{\"commonAreaId\":\"" + area.getId() + "\",\"name\":\"" + escapeJson(area.getName()) + "\"}");

        return CommonAreaResponse.from(area);
    }

    public CommonAreaResponse getCommonArea(UUID id) {
        CommonArea area = commonAreaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Common area not found: " + id));
        return CommonAreaResponse.from(area);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
