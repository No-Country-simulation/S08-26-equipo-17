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

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Residents", description = "Vínculo residente-unidad y perfiles de usuario (Dev 3)")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService residentService) {
        this.residentService = residentService;
    }

    @Operation(summary = "Listar residentes de una unidad")
    @GetMapping("/units/{unitId}/residents")
    @PreAuthorize("hasAnyRole('ADMIN','PORTARIA','MORADOR')")
    public ResponseEntity<ApiResponse<List<ResidentResponse>>> listResidents(@PathVariable UUID unitId) {
        return ResponseEntity.ok(ApiResponse.ok(residentService.listResidents(unitId)));
    }

    @Operation(summary = "Asociar un residente existente a una unidad")
    @PostMapping("/units/{unitId}/residents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidentResponse>> associateResident(
            @PathVariable UUID unitId,
            @Valid @RequestBody AssociateResidentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(residentService.associateResident(unitId, req)));
    }

    @Operation(summary = "Crear perfil de residente y asociarlo a una unidad")
    @PostMapping("/units/{unitId}/residents/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidentResponse>> createResidentProfile(
            @PathVariable UUID unitId,
            @Valid @RequestBody CreateResidentProfileRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(residentService.createResidentProfile(unitId, req)));
    }

    @Operation(summary = "Desvincular un residente de una unidad")
    @DeleteMapping("/units/{unitId}/residents/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeResident(
            @PathVariable UUID unitId, @PathVariable UUID userId) {
        residentService.removeResident(unitId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Listar perfiles de usuario")
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','PORTARIA')")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(residentService.listUsers()));
    }

    @Operation(summary = "Obtener perfil de usuario por id")
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PORTARIA')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(residentService.getUser(id)));
    }
}
