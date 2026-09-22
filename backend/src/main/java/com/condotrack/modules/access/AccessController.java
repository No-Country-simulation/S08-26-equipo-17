package com.condotrack.modules.access;

import com.condotrack.modules.access.AccessDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** REST endpoints used to create and record visitor access events. */
@RestController
@RequestMapping("/api/v1/access")
public class AccessController {

    private final AccessService accessService;

    public AccessController(AccessService accessService) {
        this.accessService = accessService;
    }

    /** Creates a temporary visitor authorization for a resident's unit. */
    @PostMapping("/authorizations")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','RESIDENT')")
    public AuthorizationResponse create(@Valid @RequestBody CreateAuthorizationRequest req) {
        return accessService.createAuthorization(req);
    }

    /** Validates a QR token and records the visitor's entry. */
    @PostMapping("/validate-qr")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public ValidateQrResponse validateQr(@Valid @RequestBody ValidateQrRequest req) {
        return accessService.validateQr(req);
    }

    /** Records an unscheduled visitor after manual confirmation. */
    @PostMapping("/manual-entry")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public AccessLogResponse manualEntry(@Valid @RequestBody ManualEntryRequest req) {
        return accessService.manualEntry(req);
    }

    /** Records a visitor leaving the building. */
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public AccessLogResponse checkout(@Valid @RequestBody CheckoutRequest req) {
        return accessService.checkout(req);
    }
}
