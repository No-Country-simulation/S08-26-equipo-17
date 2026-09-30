package com.condotrack.modules.incident;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentDtos.CreateIncidentRequest;
import com.condotrack.modules.incident.IncidentDtos.IncidentResponse;
import com.condotrack.modules.incident.IncidentDtos.UpdateIncidentStatusRequest;
import com.condotrack.modules.resident.UserUnitRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock private IncidentRepository incidentRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserUnitRepository userUnitRepository;
    @Mock private AuditService auditService;

    private IncidentService service;

    @BeforeEach
    void setUp() {
        service = new IncidentService(
                incidentRepository,
                unitRepository,
                userRepository,
                userUnitRepository,
                auditService
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Resident can create incident for their own linked unit")
    void residentCanCreateIncidentForLinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        CreateIncidentRequest req = new CreateIncidentRequest(
                unitId, "Vazamento", "Vazamento na pia da cozinha", null,
                IncidentCategory.PLUMBING, IncidentPriority.HIGH
        );

        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unitId)).thenReturn(true);
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        IncidentResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.unitId()).isEqualTo(unit.getId());
        assertThat(response.title()).isEqualTo("Vazamento");
    }

    @Test
    @DisplayName("Resident cannot create incident for unlinked unit (throws AccessDeniedException)")
    void residentCannotCreateIncidentForUnlinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unit102Id = UUID.randomUUID();
        CreateIncidentRequest req = new CreateIncidentRequest(
                unit102Id, "Barulho", "Som alto no apartamento vizinho", null,
                IncidentCategory.OTHER, IncidentPriority.MEDIUM
        );

        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unit102Id)).thenReturn(false);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Morador não pertence a esta unidade");
    }

    @Test
    @DisplayName("Admin can create incident for any unit without resident link check")
    void adminCanCreateIncidentForAnyUnit() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "102", 1);
        CreateIncidentRequest req = new CreateIncidentRequest(
                unitId, "Manutenção Elétrica", "Quadro de disjuntores geral", null,
                IncidentCategory.ELECTRICAL, IncidentPriority.URGENT
        );

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        IncidentResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.unitId()).isEqualTo(unit.getId());
    }

    @Test
    @DisplayName("Throws BusinessException when updating status to RESOLVED with null resolutionNotes")
    void updatingStatusToResolvedWithNullNotesThrowsBusinessException() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID incidentId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        IncidentTicket ticket = new IncidentTicket(building, unit, admin, "Título", "Desc", null, IncidentCategory.OTHER, IncidentPriority.LOW);

        when(incidentRepository.findById(incidentId)).thenReturn(Optional.of(ticket));

        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(IncidentStatus.RESOLVED, null, null);

        assertThatThrownBy(() -> service.updateStatus(incidentId, req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("É obrigatório fornecer o parecer de resolução ao encerrar o chamado.");
    }

    @Test
    @DisplayName("Throws BusinessException when updating status to RESOLVED with blank resolutionNotes")
    void updatingStatusToResolvedWithBlankNotesThrowsBusinessException() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID incidentId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        IncidentTicket ticket = new IncidentTicket(building, unit, admin, "Título", "Desc", null, IncidentCategory.OTHER, IncidentPriority.LOW);

        when(incidentRepository.findById(incidentId)).thenReturn(Optional.of(ticket));

        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(IncidentStatus.RESOLVED, null, "   ");

        assertThatThrownBy(() -> service.updateStatus(incidentId, req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("É obrigatório fornecer o parecer de resolução ao encerrar o chamado.");
    }

    @Test
    @DisplayName("Updates status to RESOLVED with valid resolutionNotes and logs audit")
    void updatingStatusToResolvedWithNotesSucceeds() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID incidentId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        IncidentTicket ticket = new IncidentTicket(building, unit, admin, "Título", "Desc", null, IncidentCategory.OTHER, IncidentPriority.LOW);

        when(incidentRepository.findById(incidentId)).thenReturn(Optional.of(ticket));

        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
                IncidentStatus.RESOLVED, null, "Parecer técnico de encerramento detalhado."
        );

        IncidentResponse response = service.updateStatus(incidentId, req);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("RESOLVED");
        assertThat(response.resolutionNotes()).isEqualTo("Parecer técnico de encerramento detalhado.");
        assertThat(ticket.getResolutionNotes()).isEqualTo("Parecer técnico de encerramento detalhado.");
        assertThat(ticket.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
    }
}
