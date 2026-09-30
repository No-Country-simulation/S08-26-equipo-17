package com.condotrack.modules.reservation;

import com.condotrack.modules.audit.AuditLog;
import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.reservation.ReservationDtos.CreateCommonAreaRequest;
import com.condotrack.modules.reservation.ReservationDtos.UpdateCommonAreaRequest;
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

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Administrative CRUD of Common Areas (FR-10).
 * Verifies role authorization (ADMIN only, 403 for MORADOR/RESIDENT) and audit logs.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:common_area_admin_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
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
class CommonAreaAdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private CommonAreaRepository commonAreaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @MockBean
    private JavaMailSender mailSender;

    private Building testBuilding;
    private User adminUser;
    private User residentUser;
    private String adminToken;
    private String residentToken;

    @BeforeEach
    void setUp() {
        commonAreaRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
        buildingRepository.deleteAll();

        testBuilding = buildingRepository.save(new Building("Condomínio Jardins", "Rua das Flores 123", 40));

        adminUser = userRepository.save(new User("Síndico Admin", "admin.area@condotrack.com", "hash", "11999990001", Role.ADMIN));
        residentUser = userRepository.save(new User("Morador Silva", "morador.area@condotrack.com", "hash", "11999990002", Role.MORADOR));

        adminToken = jwtService.generateAccessToken(adminUser);
        residentToken = jwtService.generateAccessToken(residentUser);
    }

    @AfterEach
    void tearDown() {
        commonAreaRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
        buildingRepository.deleteAll();
    }

    @Test
    @DisplayName("Admin pode cadastrar nova área comum (POST /api/v1/common-areas) com sucesso e log de auditoria")
    void adminCanCreateCommonAreaSuccessfully() throws Exception {
        CreateCommonAreaRequest req = new CreateCommonAreaRequest(
            testBuilding.getId(),
            "Salão Gourmet Premium",
            30,
            LocalTime.of(9, 0),
            LocalTime.of(23, 0),
            "Proibido som alto após as 22h. Limpeza inclusa na taxa."
        );

        mockMvc.perform(post("/api/v1/common-areas")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Salão Gourmet Premium"))
                .andExpect(jsonPath("$.maxCapacity").value(30))
                .andExpect(jsonPath("$.openTime").value("09:00:00"))
                .andExpect(jsonPath("$.closeTime").value("23:00:00"))
                .andExpect(jsonPath("$.rulesText").value("Proibido som alto após as 22h. Limpeza inclusa na taxa."))
                .andExpect(jsonPath("$.active").value(true));

        List<CommonArea> areas = commonAreaRepository.findAll();
        assertThat(areas).hasSize(1);
        CommonArea saved = areas.get(0);
        assertThat(saved.getName()).isEqualTo("Salão Gourmet Premium");
        assertThat(saved.getMaxCapacity()).isEqualTo(30);
        assertThat(saved.isActive()).isTrue();

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        assertThat(auditLogs).hasSize(1);
        AuditLog log = auditLogs.get(0);
        assertThat(log.getModule()).isEqualTo(AuditModule.RESERVATION);
        assertThat(log.getAction()).isEqualTo("COMMON_AREA_CREATED");
        assertThat(log.getUserId()).isEqualTo(adminUser.getId());
        assertThat(log.getMetadataJson()).contains("Salão Gourmet Premium");
    }

    @Test
    @DisplayName("Morador NÃO pode cadastrar área comum (retorna 403 Forbidden)")
    void residentCannotCreateCommonArea() throws Exception {
        CreateCommonAreaRequest req = new CreateCommonAreaRequest(
            testBuilding.getId(),
            "Piscina Coberta",
            20,
            LocalTime.of(8, 0),
            LocalTime.of(20, 0),
            "Uso exclusivo com touca."
        );

        mockMvc.perform(post("/api/v1/common-areas")
                .header("Authorization", "Bearer " + residentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());

        assertThat(commonAreaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Admin pode atualizar área comum (PUT /api/v1/common-areas/{id}) com sucesso e log de auditoria")
    void adminCanUpdateCommonAreaSuccessfully() throws Exception {
        CommonArea area = commonAreaRepository.save(new CommonArea(
            testBuilding,
            "Churrasqueira 1",
            15,
            LocalTime.of(10, 0),
            LocalTime.of(22, 0),
            "Regra original"
        ));

        UpdateCommonAreaRequest updateReq = new UpdateCommonAreaRequest(
            "Churrasqueira Gourmet Renovada",
            25,
            LocalTime.of(11, 0),
            LocalTime.of(23, 0),
            "Novas regras: não fumar no local.",
            true
        );

        mockMvc.perform(put("/api/v1/common-areas/" + area.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(area.getId().toString()))
                .andExpect(jsonPath("$.name").value("Churrasqueira Gourmet Renovada"))
                .andExpect(jsonPath("$.maxCapacity").value(25))
                .andExpect(jsonPath("$.openTime").value("11:00:00"))
                .andExpect(jsonPath("$.closeTime").value("23:00:00"))
                .andExpect(jsonPath("$.rulesText").value("Novas regras: não fumar no local."));

        CommonArea updated = commonAreaRepository.findById(area.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo("Churrasqueira Gourmet Renovada");
        assertThat(updated.getMaxCapacity()).isEqualTo(25);
        assertThat(updated.getOpenTime()).isEqualTo(LocalTime.of(11, 0));
        assertThat(updated.getCloseTime()).isEqualTo(LocalTime.of(23, 0));

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        assertThat(auditLogs).hasSize(1);
        AuditLog log = auditLogs.get(0);
        assertThat(log.getModule()).isEqualTo(AuditModule.RESERVATION);
        assertThat(log.getAction()).isEqualTo("COMMON_AREA_UPDATED");
        assertThat(log.getUserId()).isEqualTo(adminUser.getId());
    }

    @Test
    @DisplayName("Morador NÃO pode editar área comum (retorna 403 Forbidden)")
    void residentCannotUpdateCommonArea() throws Exception {
        CommonArea area = commonAreaRepository.save(new CommonArea(
            testBuilding,
            "Quadra Poliesportiva",
            20,
            LocalTime.of(8, 0),
            LocalTime.of(21, 0),
            "Uso com tênis apropriado"
        ));

        UpdateCommonAreaRequest updateReq = new UpdateCommonAreaRequest(
            "Quadra Alterada",
            50,
            LocalTime.of(7, 0),
            LocalTime.of(23, 0),
            "Regras alteradas por morador",
            true
        );

        mockMvc.perform(put("/api/v1/common-areas/" + area.getId())
                .header("Authorization", "Bearer " + residentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());

        CommonArea unchanged = commonAreaRepository.findById(area.getId()).orElseThrow();
        assertThat(unchanged.getName()).isEqualTo("Quadra Poliesportiva");
    }

    @Test
    @DisplayName("Admin pode realizar soft-delete da área comum (DELETE /api/v1/common-areas/{id})")
    void adminCanSoftDeleteCommonAreaSuccessfully() throws Exception {
        CommonArea area = commonAreaRepository.save(new CommonArea(
            testBuilding,
            "Sauna Seca",
            8,
            LocalTime.of(9, 0),
            LocalTime.of(18, 0),
            "Tempo máximo: 20 minutos"
        ));

        mockMvc.perform(delete("/api/v1/common-areas/" + area.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(area.getId().toString()))
                .andExpect(jsonPath("$.active").value(false));

        CommonArea deleted = commonAreaRepository.findById(area.getId()).orElseThrow();
        assertThat(deleted.isActive()).isFalse();

        // Verifica se a área inativa não é retornada na listagem de áreas ativas
        mockMvc.perform(get("/api/v1/common-areas")
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        assertThat(auditLogs).hasSize(1);
        AuditLog log = auditLogs.get(0);
        assertThat(log.getModule()).isEqualTo(AuditModule.RESERVATION);
        assertThat(log.getAction()).isEqualTo("COMMON_AREA_DELETED");
        assertThat(log.getUserId()).isEqualTo(adminUser.getId());
    }

    @Test
    @DisplayName("Morador NÃO pode excluir área comum (retorna 403 Forbidden)")
    void residentCannotDeleteCommonArea() throws Exception {
        CommonArea area = commonAreaRepository.save(new CommonArea(
            testBuilding,
            "Academia",
            12,
            LocalTime.of(6, 0),
            LocalTime.of(23, 0),
            "Higienizar equipamentos após o uso"
        ));

        mockMvc.perform(delete("/api/v1/common-areas/" + area.getId())
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isForbidden());

        CommonArea stillActive = commonAreaRepository.findById(area.getId()).orElseThrow();
        assertThat(stillActive.isActive()).isTrue();
    }
}
