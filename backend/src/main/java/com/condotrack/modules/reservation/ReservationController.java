package com.condotrack.modules.reservation;

import com.condotrack.modules.reservation.ReservationDtos.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Endpoints for amenity listing and conflict-free slot booking (US-06). */
@RestController
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /** Lists all active common areas in the building. */
    @GetMapping("/api/v1/common-areas")
    public List<CommonAreaResponse> listCommonAreas() {
        return reservationService.listCommonAreas();
    }

    /** Returns a specific common area by ID. */
    @GetMapping("/api/v1/common-areas/{id}")
    public CommonAreaResponse getCommonArea(@PathVariable UUID id) {
        return reservationService.getCommonArea(id);
    }

    /** Registers a new common area linked to the building (FR-10). */
    @PostMapping("/api/v1/common-areas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public CommonAreaResponse createCommonArea(@Valid @RequestBody CreateCommonAreaRequest req) {
        return reservationService.createCommonArea(req);
    }

    /** Updates data, hours, and rules of the common area (FR-10). */
    @PutMapping("/api/v1/common-areas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CommonAreaResponse updateCommonArea(@PathVariable UUID id, @Valid @RequestBody UpdateCommonAreaRequest req) {
        return reservationService.updateCommonArea(id, req);
    }

    /** Soft-deletes a common area setting isActive = false (FR-10). */
    @DeleteMapping("/api/v1/common-areas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CommonAreaResponse deleteCommonArea(@PathVariable UUID id) {
        return reservationService.deleteCommonArea(id);
    }

    /** Returns confirmed bookings for a specific area (used to render availability calendar). */
    @GetMapping("/api/v1/common-areas/{id}/reservations")
    public List<ReservationResponse> listByArea(@PathVariable UUID id) {
        return reservationService.listByArea(id);
    }

    /** Creates a reservation with atomic conflict prevention; returns 409 on overlap. */
    @PostMapping("/api/v1/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','RESIDENT','MORADOR')")
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest req) {
        return reservationService.create(req);
    }

    /** Cancels a confirmed reservation. Only the author or ADMIN may cancel. */
    @DeleteMapping("/api/v1/reservations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESIDENT','MORADOR')")
    public ReservationResponse cancel(@PathVariable UUID id) {
        return reservationService.cancel(id);
    }
}
