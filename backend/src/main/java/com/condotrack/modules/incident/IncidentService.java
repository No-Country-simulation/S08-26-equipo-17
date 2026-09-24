package com.condotrack.modules.incident;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentDtos.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public IncidentService(IncidentRepository incidentRepository, UnitRepository unitRepository,
                           UserRepository userRepository, AuditService auditService) {
        this.incidentRepository = incidentRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public IncidentResponse create(CreateIncidentRequest req) {
        User reporter = currentUser();
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));

        IncidentTicket ticket = new IncidentTicket(
            unit.getBuilding(), unit, reporter,
            req.title().trim(), req.description().trim(),
            req.photoUrl(), req.category(), req.priority()
        );
        incidentRepository.save(ticket);

        auditService.log(unit.getBuilding().getId(), unit.getId(), reporter.getId(),
            AuditModule.MAINTENANCE, "INCIDENT_OPENED",
            "Incident \"" + ticket.getTitle() + "\" reported by " + reporter.getName(),
            "{\"incidentId\":\"" + ticket.getId() + "\",\"priority\":\"" + ticket.getPriority() + "\"}");

        return IncidentResponse.from(ticket);
    }

    @Transactional
    public IncidentResponse updateStatus(UUID id, UpdateIncidentStatusRequest req) {
        User admin = currentUser();
        IncidentTicket ticket = incidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));

        User assignedTo = null;
        if (req.assignedToUserId() != null) {
            assignedTo = userRepository.findById(req.assignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.assignedToUserId()));
        }

        ticket.updateStatus(req.status(), assignedTo);

        Unit unit = ticket.getUnit();
        UUID unitId = unit != null ? unit.getId() : null;
        auditService.log(ticket.getBuilding().getId(), unitId, admin.getId(),
            AuditModule.MAINTENANCE, "INCIDENT_STATUS_UPDATED",
            "Incident \"" + ticket.getTitle() + "\" updated to " + req.status() + " by " + admin.getName(),
            "{\"incidentId\":\"" + ticket.getId() + "\",\"status\":\"" + req.status() + "\"}");

        return IncidentResponse.from(ticket);
    }

    public Page<IncidentResponse> list(Pageable pageable) {
        return incidentRepository.findByOrderByCreatedAtDesc(pageable).map(IncidentResponse::from);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
