package com.condotrack.modules.move;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.move.MoveDtos.*;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business rules for requesting and reviewing move shifts (US-07). */
@Service
@Transactional(readOnly = true)
public class MoveService {

    private final MoveRepository moveRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MoveService(MoveRepository moveRepository, UnitRepository unitRepository,
                       UserRepository userRepository, AuditService auditService) {
        this.moveRepository = moveRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    /** Lists all REQUESTED moves pending admin review. */
    public List<MoveResponse> listPending() {
        return moveRepository.findByStatusOrderByScheduledDateAsc(MoveStatus.REQUESTED)
            .stream().map(MoveResponse::from).toList();
    }

    /** Lists all moves for a given unit. */
    public List<MoveResponse> listByUnit(UUID unitId) {
        return moveRepository.findByUnitIdOrderByScheduledDateDesc(unitId)
            .stream().map(MoveResponse::from).toList();
    }

    /** Resident requests a move shift. */
    @Transactional
    public MoveResponse create(CreateMoveRequest req) {
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));

        User requester = currentUser();

        MoveSchedule move = new MoveSchedule(unit, requester, req.moveType(), req.scheduledDate(), req.shift());
        moveRepository.save(move);

        auditService.log(unit.getBuilding().getId(), unit.getId(), requester.getId(),
            AuditModule.MOVE, "MOVE_REQUESTED",
            "Move " + req.moveType() + " requested for " + req.scheduledDate() + " (" + req.shift() + ")",
            "{\"moveId\":\"" + move.getId() + "\",\"shift\":\"" + req.shift() + "\"}");

        return MoveResponse.from(move);
    }

    /** Admin approves or rejects a move request. On approval, checks for shift conflicts. */
    @Transactional
    public MoveResponse review(UUID id, ReviewMoveRequest req) {
        MoveSchedule move = moveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Move schedule not found: " + id));

        if (move.getStatus() != MoveStatus.REQUESTED) {
            throw new BusinessException("Move is already " + move.getStatus());
        }

        User admin = currentUser();

        if (req.status() == MoveStatus.APPROVED) {
            boolean conflict = moveRepository.existsApprovedConflict(
                move.getUnit().getBuilding().getId(), move.getScheduledDate(), move.getShift());
            if (conflict) {
                throw new BusinessException(
                    "Shift " + move.getShift() + " on " + move.getScheduledDate() + " is already taken");
            }
            move.approve(req.adminNotes());
        } else if (req.status() == MoveStatus.REJECTED) {
            move.reject(req.adminNotes());
        } else {
            throw new BusinessException("Invalid review status: " + req.status());
        }

        Unit unit = move.getUnit();
        auditService.log(unit.getBuilding().getId(), unit.getId(), admin.getId(),
            AuditModule.MOVE, "MOVE_" + req.status(),
            "Move " + id + " " + req.status().name().toLowerCase() + " by admin",
            "{\"moveId\":\"" + id + "\",\"adminNotes\":\"" + req.adminNotes() + "\"}");

        return MoveResponse.from(move);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
