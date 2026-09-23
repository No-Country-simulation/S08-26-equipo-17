package com.condotrack.modules.reservation;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.reservation.ReservationDtos.*;
import java.util.List;
import java.util.UUID;
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
    private final AuditService auditService;

    public ReservationService(CommonAreaRepository commonAreaRepository,
                              ReservationRepository reservationRepository,
                              UnitRepository unitRepository,
                              UserRepository userRepository,
                              AuditService auditService) {
        this.commonAreaRepository = commonAreaRepository;
        this.reservationRepository = reservationRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
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

        CommonArea area = commonAreaRepository.findById(req.commonAreaId())
            .orElseThrow(() -> new ResourceNotFoundException("Common area not found: " + req.commonAreaId()));

        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));

        if (reservationRepository.existsConflict(area.getId(), req.startTime(), req.endTime())) {
            throw new ConflictException("Time slot already booked for: " + area.getName());
        }

        User requester = currentUser();
        Reservation reservation = new Reservation(area, unit, requester, req.startTime(), req.endTime());
        reservationRepository.save(reservation);

        auditService.log(unit.getBuilding().getId(), unit.getId(), requester.getId(),
            AuditModule.RESERVATION, "RESERVATION_CREATED",
            "Reservation for " + area.getName() + " from " + req.startTime() + " to " + req.endTime(),
            "{\"commonAreaId\":\"" + area.getId() + "\",\"startTime\":\"" + req.startTime() + "\"}");

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

        return ReservationResponse.from(reservation);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
