package com.condotrack.modules.audit;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** REST endpoint for reading the operational audit timeline. */
@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    /** Lists audit events, optionally filtered by unit. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public Page<AuditService.AuditResponse> list(
            @RequestParam(required = false) UUID unitId,
            @PageableDefault(size = 20, sort = "timestamp", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return auditService.list(unitId, pageable);
    }
}
