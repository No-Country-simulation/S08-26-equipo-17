package com.condotrack.modules.incident;

import com.condotrack.modules.audit.AuditLog;
import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentDtos.UpdateIncidentStatusRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Incident Resolution Notes and Lifecycle (FR-17).
 * Verifies mandatory technical resolution notes when resolving a ticket, persistence,
 * response serialization, and audit trail metadata.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:incident_notes_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.jackson.serialization.write-dates-as-timestamps=false",
    "app.security.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "app.security.jwt.expiration-ms=86400000",
    "app.security.jwt.refresh-expiration-ms=604800000"
})
class IncidentResolutionNotesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @MockBean
    private JavaMailSender mailSender;

    private Building testBuilding;
    private Unit testUnit;
    private User adminUser;
    private User residentUser;
    private User technicianUser;
    private IncidentTicket ticket;
    private String adminToken;
    private String residentToken;

    @BeforeEach
    void setUp() {
        incidentRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
        unitRepository.deleteAll();
        buildingRepository.deleteAll();

        testBuilding = buildingRepository.save(new Building("Edifício Horizonte", "Rua das Acácias 500", 30));
        testUnit = unitRepository.save(new Unit(testBuilding, "Torre 1", "101", 1));

        adminUser = userRepository.save(new User("Síndico Admin", "admin.inc@condotrack.com", "hash", "11999990001", Role.ADMIN));
        residentUser = userRepository.save(new User("Morador João", "morador.inc@condotrack.com", "hash", "11999990002", Role.RESIDENT));
        technicianUser = userRepository.save(new User("Técnico Carlos", "tecnico.inc@condotrack.com", "hash", "11999990003", Role.ADMIN));

        adminToken = jwtService.generateAccessToken(adminUser);
        residentToken = jwtService.generateAccessToken(residentUser);

        ticket = incidentRepository.save(new IncidentTicket(
            testBuilding,
            testUnit,
            residentUser,
            "Vazamento no banheiro",
            "Cano furado sob a pia do banheiro social",
            null,
            IncidentCategory.PLUMBING,
            IncidentPriority.HIGH
        ));
    }

    @AfterEach
    void tearDown() {
        incidentRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
        unitRepository.deleteAll();
        buildingRepository.deleteAll();
    }

    @Test
    @DisplayName("Encerramento com status RESOLVED sem parecer técnico lança BusinessException (HTTP 400)")
    void resolvingWithoutResolutionNotesReturnsBadRequest() throws Exception {
        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
            IncidentStatus.RESOLVED,
            technicianUser.getId(),
            "" // em branco
        );

        mockMvc.perform(patch("/api/v1/incidents/" + ticket.getId() + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("É obrigatório fornecer o parecer de resolução ao encerrar o chamado."));

        IncidentTicket unmodified = incidentRepository.findById(ticket.getId()).orElseThrow();
        assertThat(unmodified.getStatus()).isEqualTo(IncidentStatus.OPEN);
        assertThat(unmodified.getResolutionNotes()).isNull();
    }

    @Test
    @DisplayName("Encerramento com status RESOLVED com null em resolutionNotes lança BusinessException (HTTP 400)")
    void resolvingWithNullResolutionNotesReturnsBadRequest() throws Exception {
        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
            IncidentStatus.RESOLVED,
            technicianUser.getId(),
            null
        );

        mockMvc.perform(patch("/api/v1/incidents/" + ticket.getId() + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("É obrigatório fornecer o parecer de resolução ao encerrar o chamado."));
    }

    @Test
    @DisplayName("Encerramento com status RESOLVED com parecer técnico grava resolutionNotes e metadados no AuditService")
    void resolvingWithResolutionNotesSucceedsAndAudits() throws Exception {
        String technicalReport = "Substituição do sifão e vedação com fita teflon. Testado sob pressão normal sem vazamentos.";

        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
            IncidentStatus.RESOLVED,
            technicianUser.getId(),
            technicalReport
        );

        mockMvc.perform(patch("/api/v1/incidents/" + ticket.getId() + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ticket.getId().toString()))
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.resolutionNotes").value(technicalReport))
                .andExpect(jsonPath("$.resolvedAt").isNotEmpty());

        IncidentTicket updatedTicket = incidentRepository.findById(ticket.getId()).orElseThrow();
        assertThat(updatedTicket.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
        assertThat(updatedTicket.getResolutionNotes()).isEqualTo(technicalReport);
        assertThat(updatedTicket.getResolvedAt()).isNotNull();

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        assertThat(auditLogs).hasSize(1);
        AuditLog auditLog = auditLogs.get(0);
        assertThat(auditLog.getModule()).isEqualTo(AuditModule.MAINTENANCE);
        assertThat(auditLog.getAction()).isEqualTo("INCIDENT_STATUS_UPDATED");
        assertThat(auditLog.getMetadataJson()).contains(technicalReport);
        assertThat(auditLog.getMetadataJson()).contains("RESOLVED");
        assertThat(auditLog.getMetadataJson()).contains("resolutionNotes");
    }

    @Test
    @DisplayName("Atualização para CLOSED grava resolutionNotes opcional e atualiza chamado")
    void closingWithResolutionNotesSucceeds() throws Exception {
        String finalNotes = "Chamado encerrado definitivamente após 48h de monitoramento.";

        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
            IncidentStatus.CLOSED,
            technicianUser.getId(),
            finalNotes
        );

        mockMvc.perform(patch("/api/v1/incidents/" + ticket.getId() + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.resolutionNotes").value(finalNotes));

        IncidentTicket updatedTicket = incidentRepository.findById(ticket.getId()).orElseThrow();
        assertThat(updatedTicket.getStatus()).isEqualTo(IncidentStatus.CLOSED);
        assertThat(updatedTicket.getResolutionNotes()).isEqualTo(finalNotes);
    }

    @Test
    @DisplayName("Morador NÃO pode alterar status do chamado (retorna 403 Forbidden)")
    void residentCannotUpdateIncidentStatus() throws Exception {
        UpdateIncidentStatusRequest req = new UpdateIncidentStatusRequest(
            IncidentStatus.RESOLVED,
            null,
            "Tentativa de encerramento por morador"
        );

        mockMvc.perform(patch("/api/v1/incidents/" + ticket.getId() + "/status")
                .header("Authorization", "Bearer " + residentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}
