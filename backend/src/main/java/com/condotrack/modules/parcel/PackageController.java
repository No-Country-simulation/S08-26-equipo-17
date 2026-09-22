package com.condotrack.modules.parcel;

import com.condotrack.modules.parcel.PackageDtos.*;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** REST endpoints for receiving, listing, and handing over packages. */
@RestController
@RequestMapping("/api/v1/packages")
public class PackageController {

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    /** Registers a package received by the concierge team. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public PackageResponse register(@Valid @RequestBody RegisterPackageRequest req) {
        return packageService.register(req);
    }

    /** Returns packages that are still waiting for resident pickup. */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public Page<PackageResponse> listPending(
            @PageableDefault(size = 20, sort = "receivedAt",
                direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return packageService.listPending(pageable);
    }

    /** Marks a package as delivered and stores who picked it up. */
    @PatchMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE')")
    public PackageResponse deliver(@PathVariable UUID id, @Valid @RequestBody DeliverPackageRequest req) {
        return packageService.deliver(id, req);
    }
}
