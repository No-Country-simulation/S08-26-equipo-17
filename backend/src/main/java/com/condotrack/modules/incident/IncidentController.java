package com.condotrack.modules.incident;

import com.condotrack.modules.incident.IncidentDtos.*;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /** Any authenticated user (resident or concierge) can report a maintenance issue. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@Valid @RequestBody CreateIncidentRequest req) {
        return incidentService.create(req);
    }

    /** Returns all incidents, newest first. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public Page<IncidentResponse> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return incidentService.list(pageable);
    }

    /** Admin assigns a technician and advances the ticket lifecycle. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public IncidentResponse updateStatus(@PathVariable UUID id,
                                         @Valid @RequestBody UpdateIncidentStatusRequest req) {
        return incidentService.updateStatus(id, req);
    }
}
