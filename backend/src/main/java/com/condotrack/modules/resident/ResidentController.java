package com.condotrack.modules.resident;

import com.condotrack.common.dto.ApiResponse;
import com.condotrack.modules.resident.ResidentDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoints for residents and user profiles.
 *
 * <p>Base path: {@code /api/v1}. All routes return {@link ApiResponse} wrappers.</p>
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Residents", description = "Resident-unit links and user profiles")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService residentService) {
        this.residentService = residentService;
    }

    @Operation(summary = "List all residents of a unit")
    @GetMapping("/units/{unitId}/residents")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE','RESIDENT')")
    public ResponseEntity<ApiResponse<List<ResidentResponse>>> listResidents(@PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.ok(residentService.listResidents(unitId)));
    }

    @Operation(summary = "Link an existing user to a unit as resident")
    @PostMapping("/units/{unitId}/residents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidentResponse>> associateResident(
            @PathVariable UUID unitId,
            @Valid @RequestBody AssociateResidentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(residentService.associateResident(unitId, req)));
    }

    @Operation(summary = "Create a resident profile and link it to a unit")
    @PostMapping("/units/{unitId}/residents/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidentResponse>> createResidentProfile(
            @PathVariable UUID unitId,
            @Valid @RequestBody CreateResidentProfileRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(residentService.createResidentProfile(unitId, req)));
    }

    @Operation(summary = "Unlink a resident from a unit")
    @DeleteMapping("/units/{unitId}/residents/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeResident(
            @PathVariable UUID unitId, @PathVariable UUID userId) {
        residentService.removeResident(unitId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "List user profiles")
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(residentService.listUsers()));
    }

    @Operation(summary = "Get a user profile by id")
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(residentService.getUser(id)));
    }
}
