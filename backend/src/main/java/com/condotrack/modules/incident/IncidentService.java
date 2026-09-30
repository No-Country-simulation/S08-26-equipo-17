package com.condotrack.modules.incident;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentDtos.*;
import com.condotrack.modules.resident.UserUnitRepository;
import com.condotrack.modules.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final UserUnitRepository userUnitRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public IncidentService(IncidentRepository incidentRepository, UnitRepository unitRepository,
                           UserRepository userRepository, UserUnitRepository userUnitRepository,
                           AuditService auditService) {
        this(incidentRepository, unitRepository, userRepository, userUnitRepository, auditService, null);
    }

    @Autowired
    public IncidentService(IncidentRepository incidentRepository, UnitRepository unitRepository,
                           UserRepository userRepository, UserUnitRepository userUnitRepository,
                           AuditService auditService,
                           @Autowired(required = false) NotificationService notificationService) {
        this.incidentRepository = incidentRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.userUnitRepository = userUnitRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public IncidentResponse create(CreateIncidentRequest req) {
        User reporter = currentUser();
        if (reporter.getRole().isResident() && req.unitId() != null
                && !userUnitRepository.existsByUserIdAndUnitId(reporter.getId(), req.unitId())) {
            throw new AccessDeniedException("Morador não pertence a esta unidade");
        }

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

        if (req.status() == IncidentStatus.RESOLVED && (req.resolutionNotes() == null || req.resolutionNotes().isBlank())) {
            throw new BusinessException("É obrigatório fornecer o parecer de resolução ao encerrar o chamado.");
        }

        User assignedTo = null;
        if (req.assignedToUserId() != null) {
            assignedTo = userRepository.findById(req.assignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.assignedToUserId()));
        }

        if (req.status() == IncidentStatus.RESOLVED || req.status() == IncidentStatus.CLOSED) {
            if (req.resolutionNotes() != null && !req.resolutionNotes().isBlank()) {
                ticket.setResolutionNotes(req.resolutionNotes().trim());
            }
        }

        ticket.updateStatus(req.status(), assignedTo);

        if (notificationService != null && ticket.getCreatedBy() != null) {
            String title = (req.status() == IncidentStatus.RESOLVED || req.status() == IncidentStatus.CLOSED)
                ? "Chamado Concluído"
                : "Atualização no Chamado";
            String message = "O chamado \"" + ticket.getTitle() + "\" teve seu status atualizado para " + req.status() + ".";
            notificationService.sendInAppNotification(ticket.getCreatedBy(), title, message, "MAINTENANCE");
        }

        Unit unit = ticket.getUnit();
        UUID unitId = unit != null ? unit.getId() : null;
        String notesFragment = ticket.getResolutionNotes() != null
            ? ",\"resolutionNotes\":\"" + escapeJson(ticket.getResolutionNotes()) + "\""
            : "";
        auditService.log(ticket.getBuilding().getId(), unitId, admin.getId(),
            AuditModule.MAINTENANCE, "INCIDENT_STATUS_UPDATED",
            "Incident \"" + ticket.getTitle() + "\" updated to " + req.status() + " by " + admin.getName(),
            "{\"incidentId\":\"" + ticket.getId() + "\",\"status\":\"" + req.status() + "\"" + notesFragment + "}");

        return IncidentResponse.from(ticket);
    }

    public Page<IncidentResponse> list(Pageable pageable) {
        return incidentRepository.findByOrderByCreatedAtDesc(pageable).map(IncidentResponse::from);
    }

    public record PhotoResource(Resource resource, MediaType mediaType) {}

    public ResponseEntity<Resource> getPhoto(String filename) {
        PhotoResource photo = loadPhoto(filename);
        return ResponseEntity.ok()
                .contentType(photo.mediaType())
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(photo.resource());
    }

    public PhotoResource loadPhoto(String filename) {
        if (filename == null || filename.isBlank() || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new ResourceNotFoundException("Photo not found: " + filename);
        }

        Path uploadDir = Paths.get("uploads", "incidents").toAbsolutePath().normalize();
        Path filePath = uploadDir.resolve(filename).normalize();

        if (!filePath.startsWith(uploadDir) || !Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            throw new ResourceNotFoundException("Photo not found: " + filename);
        }

        User user = currentUser();
        boolean isStaff = user.getRole().isAdmin() || user.getRole().isConcierge();

        if (!isStaff) {
            if (user.getRole().isResident()) {
                List<IncidentTicket> tickets = incidentRepository.findByPhotoUrlContaining(filename);
                if (tickets.isEmpty()) {
                    throw new AccessDeniedException("Access denied to this incident photo.");
                }
                boolean authorized = tickets.stream().anyMatch(ticket -> {
                    boolean isCreator = ticket.getCreatedBy() != null && ticket.getCreatedBy().getId().equals(user.getId());
                    boolean isSameUnit = ticket.getUnit() != null && userUnitRepository.existsByUserIdAndUnitId(user.getId(), ticket.getUnit().getId());
                    return isCreator || isSameUnit;
                });
                if (!authorized) {
                    throw new AccessDeniedException("Access denied to this incident photo.");
                }
            } else {
                throw new AccessDeniedException("Access denied to this incident photo.");
            }
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Photo not found: " + filename);
            }
            MediaType mediaType = determineMediaType(filePath, filename);
            return new PhotoResource(resource, mediaType);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Photo not found: " + filename);
        }
    }

    private MediaType determineMediaType(Path filePath, String filename) {
        try {
            String probe = Files.probeContentType(filePath);
            if (probe != null && !probe.isBlank()) {
                return MediaType.parseMediaType(probe);
            }
        } catch (IOException ignored) {}

        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
