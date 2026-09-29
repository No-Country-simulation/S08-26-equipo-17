package com.condotrack.modules.overview;

import com.condotrack.common.dto.ApiResponse;
import com.condotrack.modules.overview.UnitOverviewDtos.UnitOverviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/units")
public class UnitOverviewController {

    private final UnitOverviewService unitOverviewService;

    public UnitOverviewController(UnitOverviewService unitOverviewService) {
        this.unitOverviewService = unitOverviewService;
    }

    /**
     * Core MVP Endpoint: Consolidated 360° overview of unit, residents, packages,
     * visits, bookings, moves, incidents, and audit timeline.
     */
    @GetMapping("/{id}/overview-360")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE','RESIDENT')")
    public ResponseEntity<ApiResponse<UnitOverviewResponse>> getOverview360(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(unitOverviewService.getOverview(id)));
    }
}
