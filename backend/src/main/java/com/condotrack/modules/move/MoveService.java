package com.condotrack.modules.move;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.move.MoveDtos.*;
import com.condotrack.modules.notification.NotificationService;
import com.condotrack.modules.resident.UserUnitRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
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
    private final UserUnitRepository userUnitRepository;
    private final AuditService auditService;
    private final BuildingRepository buildingRepository;
    private final NotificationService notificationService;

    public MoveService(MoveRepository moveRepository, UnitRepository unitRepository,
                       UserRepository userRepository, UserUnitRepository userUnitRepository,
                       AuditService auditService) {
        this(moveRepository, unitRepository, userRepository, userUnitRepository, auditService, null, null);
    }

    public MoveService(MoveRepository moveRepository, UnitRepository unitRepository,
                       UserRepository userRepository, UserUnitRepository userUnitRepository,
                       AuditService auditService, BuildingRepository buildingRepository) {
        this(moveRepository, unitRepository, userRepository, userUnitRepository, auditService, buildingRepository, null);
    }

    @Autowired
    public MoveService(MoveRepository moveRepository, UnitRepository unitRepository,
                       UserRepository userRepository, UserUnitRepository userUnitRepository,
                       AuditService auditService,
                       @Autowired(required = false) BuildingRepository buildingRepository,
                       @Autowired(required = false) NotificationService notificationService) {
        this.moveRepository = moveRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.userUnitRepository = userUnitRepository;
        this.auditService = auditService;
        this.buildingRepository = buildingRepository;
        this.notificationService = notificationService;
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
        User requester = currentUser();
        if (requester.getRole().isResident() && !userUnitRepository.existsByUserIdAndUnitId(requester.getId(), req.unitId())) {
            throw new AccessDeniedException("Morador só pode solicitar mudança para a sua própria unidade");
        }

        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));

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
        MoveSchedule move = moveRepository.findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Move schedule not found: " + id));

        if (move.getStatus() != MoveStatus.REQUESTED) {
            throw new BusinessException("Move is already " + move.getStatus());
        }

        User admin = currentUser();

        if (req.status() == MoveStatus.APPROVED) {
            if (buildingRepository != null) {
                buildingRepository.findByIdForUpdate(move.getUnit().getBuilding().getId());
            }
            boolean conflict = moveRepository.existsApprovedConflict(
                move.getUnit().getBuilding().getId(), move.getScheduledDate(), move.getShift());
            if (conflict) {
                throw new ConflictException(
                    "Shift " + move.getShift() + " on " + move.getScheduledDate() + " is already taken");
            }
            move.approve(req.adminNotes());
            if (notificationService != null && move.getUser() != null) {
                String note = (req.adminNotes() != null && !req.adminNotes().isBlank()) ? " Observação: " + req.adminNotes() : "";
                notificationService.sendInAppNotification(
                    move.getUser(),
                    "Mudança Aprovada",
                    "Sua solicitação de mudança para " + move.getScheduledDate() + " (" + move.getShift() + ") foi aprovada pelo síndico." + note,
                    "MOVE"
                );
            }
        } else if (req.status() == MoveStatus.REJECTED) {
            move.reject(req.adminNotes());
            if (notificationService != null && move.getUser() != null) {
                String note = (req.adminNotes() != null && !req.adminNotes().isBlank()) ? " Motivo: " + req.adminNotes() : "";
                notificationService.sendInAppNotification(
                    move.getUser(),
                    "Mudança Rejeitada",
                    "Sua solicitação de mudança para " + move.getScheduledDate() + " (" + move.getShift() + ") foi rejeitada pelo síndico." + note,
                    "MOVE"
                );
            }
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
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
