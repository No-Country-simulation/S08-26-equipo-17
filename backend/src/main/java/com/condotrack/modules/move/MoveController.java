package com.condotrack.modules.move;

import com.condotrack.modules.move.MoveDtos.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Endpoints for move shift scheduling and admin approval (US-07). */
@RestController
public class MoveController {

    private final MoveService moveService;

    public MoveController(MoveService moveService) {
        this.moveService = moveService;
    }

    /** Lists all pending move requests (admin review queue). */
    @GetMapping("/api/v1/moves/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MoveResponse> listPending() {
        return moveService.listPending();
    }

    /** Lists all moves for a specific unit. */
    @GetMapping("/api/v1/units/{unitId}/moves")
    @PreAuthorize("hasAnyRole('ADMIN','PORTARIA','RESIDENT')")
    public List<MoveResponse> listByUnit(@PathVariable UUID unitId) {
        return moveService.listByUnit(unitId);
    }

    /** Resident requests a move-in or move-out shift. */
    @PostMapping("/api/v1/moves")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','RESIDENT')")
    public MoveResponse create(@Valid @RequestBody CreateMoveRequest req) {
        return moveService.create(req);
    }

    /** Admin approves or rejects a move request. */
    @PatchMapping("/api/v1/moves/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public MoveResponse review(@PathVariable UUID id, @Valid @RequestBody ReviewMoveRequest req) {
        return moveService.review(id, req);
    }
}
