package com.condotrack.config;

import com.condotrack.common.exception.GlobalExceptionHandler;
import com.condotrack.modules.access.AccessLogRepository;
import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.CustomUserDetailsService;
import com.condotrack.modules.auth.JwtAuthenticationFilter;
import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentController;
import com.condotrack.modules.incident.IncidentRepository;
import com.condotrack.modules.incident.IncidentService;
import com.condotrack.modules.move.MoveController;
import com.condotrack.modules.move.MoveRepository;
import com.condotrack.modules.move.MoveService;
import com.condotrack.modules.overview.UnitOverviewController;
import com.condotrack.modules.overview.UnitOverviewService;
import com.condotrack.modules.parcel.PackageDeliveryRepository;
import com.condotrack.modules.reservation.CommonArea;
import com.condotrack.modules.reservation.CommonAreaRepository;
import com.condotrack.modules.reservation.ReservationController;
import com.condotrack.modules.reservation.ReservationRepository;
import com.condotrack.modules.reservation.ReservationService;
import com.condotrack.modules.resident.UserUnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        UnitOverviewController.class,
        ReservationController.class,
        MoveController.class,
        IncidentController.class
})
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        JwtService.class,
        JwtAuthenticationFilter.class,
        GlobalExceptionHandler.class,
        UnitOverviewService.class,
        ReservationService.class,
        MoveService.class,
        IncidentService.class
})
@TestPropertySource(properties = {
        "app.security.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nw==",
        "app.security.jwt.expiration-ms=3600000",
        "app.security.jwt.refresh-expiration-ms=604800000",
        "app.cors.allowed-origins=http://localhost:3000"
})
class UnitIsolationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserUnitRepository userUnitRepository;

    @MockBean
    private UnitRepository unitRepository;

    @MockBean
    private BuildingRepository buildingRepository;

    @MockBean
    private CommonAreaRepository commonAreaRepository;

    @MockBean
    private ReservationRepository reservationRepository;

    @MockBean
    private MoveRepository moveRepository;

    @MockBean
    private IncidentRepository incidentRepository;

    @MockBean
    private com.condotrack.modules.notification.NotificationService notificationService;

    @MockBean
    private PackageDeliveryRepository packageDeliveryRepository;

    @MockBean
    private AccessLogRepository accessLogRepository;

    @MockBean
    private AuditLogRepository auditLogRepository;

    @MockBean
    private AuditService auditService;

    private User admin;
    private User concierge;
    private User resident101;

    private String adminToken;
    private String conciergeToken;
    private String resident101Token;

    private UUID unit101Id;
    private UUID unit102Id;
    private Unit unit101;
    private Unit unit102;
    private CommonArea commonArea;

    private CommonArea createCommonArea(UUID id, String name, Building building) {
        try {
            var constructor = CommonArea.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            CommonArea area = constructor.newInstance();
            org.springframework.test.util.ReflectionTestUtils.setField(area, "id", id);
            org.springframework.test.util.ReflectionTestUtils.setField(area, "name", name);
            org.springframework.test.util.ReflectionTestUtils.setField(area, "building", building);
            return area;
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @BeforeEach
    void setUp() {
        admin = new User("Admin", "admin@condotrack.com", "hash", "11999990001", Role.ADMIN);
        concierge = new User("Concierge", "concierge@condotrack.com", "hash", "11999990002", Role.CONCIERGE);
        resident101 = new User("Morador 101", "resident101@condotrack.com", "hash", "11999990003", Role.RESIDENT);

        when(userDetailsService.loadUserByUsername("admin@condotrack.com")).thenReturn(admin);
        when(userDetailsService.loadUserByUsername("concierge@condotrack.com")).thenReturn(concierge);
        when(userDetailsService.loadUserByUsername("resident101@condotrack.com")).thenReturn(resident101);

        when(userRepository.findByEmailIgnoreCase("admin@condotrack.com")).thenReturn(Optional.of(admin));
        when(userRepository.findByEmailIgnoreCase("concierge@condotrack.com")).thenReturn(Optional.of(concierge));
        when(userRepository.findByEmailIgnoreCase("resident101@condotrack.com")).thenReturn(Optional.of(resident101));

        adminToken = jwtService.generateAccessToken(admin);
        conciergeToken = jwtService.generateAccessToken(concierge);
        resident101Token = jwtService.generateAccessToken(resident101);

        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        unit101Id = UUID.randomUUID();
        unit102Id = UUID.randomUUID();
        unit101 = new Unit(building, "Torre A", "101", 1);
        unit102 = new Unit(building, "Torre A", "102", 1);
        org.springframework.test.util.ReflectionTestUtils.setField(unit101, "id", unit101Id);
        org.springframework.test.util.ReflectionTestUtils.setField(unit102, "id", unit102Id);
        commonArea = createCommonArea(UUID.randomUUID(), "Salão Gourmet", building);

        when(unitRepository.findById(unit101Id)).thenReturn(Optional.of(unit101));
        when(unitRepository.findById(unit102Id)).thenReturn(Optional.of(unit102));
        when(commonAreaRepository.findById(any())).thenReturn(Optional.of(commonArea));
        when(commonAreaRepository.findByIdForUpdate(any())).thenReturn(Optional.of(commonArea));

        // Morador 101 pertence apenas à unidade 101
        when(userUnitRepository.existsByUserIdAndUnitId(resident101.getId(), unit101Id)).thenReturn(true);
        when(userUnitRepository.existsByUserIdAndUnitId(resident101.getId(), unit102Id)).thenReturn(false);

        // Mocks para preencher o overview 360 sem erros
        when(userUnitRepository.findResidentsByUnitId(any())).thenReturn(List.of());
        when(packageDeliveryRepository.findByUnitIdOrderByReceivedAtDesc(any())).thenReturn(List.of());
        when(accessLogRepository.findByUnitIdOrderByTimestampDesc(any())).thenReturn(List.of());
        when(reservationRepository.findByUnitIdOrderByStartTimeDesc(any())).thenReturn(List.of());
        when(moveRepository.findByUnitIdOrderByScheduledDateDesc(any())).thenReturn(List.of());
        when(incidentRepository.findByUnitIdAndStatusNotOrderByCreatedAtDesc(any(), any())).thenReturn(List.of());
        when(auditLogRepository.findByUnitIdOrderByTimestampDesc(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
    }

    // -------------------------------------------------------------
    // Requisito 1: Visão 360° (/api/v1/units/{id}/overview-360)
    // -------------------------------------------------------------

    @Test
    @DisplayName("Admin acessa a unidade 101 normalmente (200 OK)")
    void adminCanAccessUnit101Overview() throws Exception {
        mockMvc.perform(get("/api/v1/units/" + unit101Id + "/overview-360")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"))
                .andExpect(jsonPath("$.data.unit.buildingName").value("Edifício Solar"));
    }

    @Test
    @DisplayName("Concierge acessa a unidade 101 normalmente (200 OK)")
    void conciergeCanAccessUnit101Overview() throws Exception {
        mockMvc.perform(get("/api/v1/units/" + unit101Id + "/overview-360")
                        .header("Authorization", "Bearer " + conciergeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"))
                .andExpect(jsonPath("$.data.unit.buildingName").value("Edifício Solar"));
    }

    @Test
    @DisplayName("Morador da unidade 101 acessa a unidade 101 (200 OK)")
    void resident101CanAccessUnit101Overview() throws Exception {
        mockMvc.perform(get("/api/v1/units/" + unit101Id + "/overview-360")
                        .header("Authorization", "Bearer " + resident101Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"));
    }

    @Test
    @DisplayName("Morador da unidade 101 tentando acessar a unidade 102 recebe 403 Forbidden")
    void resident101CannotAccessUnit102Overview() throws Exception {
        mockMvc.perform(get("/api/v1/units/" + unit102Id + "/overview-360")
                        .header("Authorization", "Bearer " + resident101Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("Access Denied"))
                .andExpect(jsonPath("$.detail").value("Morador não tem permissão para visualizar dados de outra unidade"));
    }

    // -------------------------------------------------------------
    // Requisito 2: Reservas (POST /api/v1/reservations)
    // -------------------------------------------------------------

    @Test
    @DisplayName("Morador da unidade 101 cria reserva para unidade 101 (201 Created)")
    void residentCanCreateReservationForOwnUnit() throws Exception {
        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        OffsetDateTime end = start.plusHours(2);
        String body = """
                {
                    "commonAreaId": "%s",
                    "unitId": "%s",
                    "startTime": "%s",
                    "endTime": "%s"
                }
                """.formatted(commonArea.getId(), unit101Id, start, end);

        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Morador da unidade 101 tentando criar reserva para unidade 102 recebe 403 Forbidden")
    void residentCannotCreateReservationForOtherUnit() throws Exception {
        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        OffsetDateTime end = start.plusHours(2);
        String body = """
                {
                    "commonAreaId": "%s",
                    "unitId": "%s",
                    "startTime": "%s",
                    "endTime": "%s"
                }
                """.formatted(commonArea.getId(), unit102Id, start, end);

        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("Access Denied"));
    }

    // -------------------------------------------------------------
    // Requisito 3: Mudanças (POST /api/v1/moves)
    // -------------------------------------------------------------

    @Test
    @DisplayName("Morador da unidade 101 solicita mudança para unidade 101 (201 Created)")
    void residentCanCreateMoveForOwnUnit() throws Exception {
        LocalDate date = LocalDate.now().plusDays(7);
        String body = """
                {
                    "unitId": "%s",
                    "moveType": "IN",
                    "scheduledDate": "%s",
                    "shift": "MORNING"
                }
                """.formatted(unit101Id, date);

        mockMvc.perform(post("/api/v1/moves")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Morador da unidade 101 tentando solicitar mudança para unidade 102 recebe 403 Forbidden")
    void residentCannotCreateMoveForOtherUnit() throws Exception {
        LocalDate date = LocalDate.now().plusDays(7);
        String body = """
                {
                    "unitId": "%s",
                    "moveType": "IN",
                    "scheduledDate": "%s",
                    "shift": "MORNING"
                }
                """.formatted(unit102Id, date);

        mockMvc.perform(post("/api/v1/moves")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("Access Denied"));
    }

    // -------------------------------------------------------------
    // Requisito 4: Chamados (POST /api/v1/incidents)
    // -------------------------------------------------------------

    @Test
    @DisplayName("Morador da unidade 101 abre chamado para unidade 101 (201 Created)")
    void residentCanCreateIncidentForOwnUnit() throws Exception {
        String body = """
                {
                    "unitId": "%s",
                    "title": "Vazamento na torneira",
                    "description": "Pingando sem parar na pia do banheiro",
                    "category": "PLUMBING",
                    "priority": "MEDIUM"
                }
                """.formatted(unit101Id);

        mockMvc.perform(post("/api/v1/incidents")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Morador da unidade 101 tentando abrir chamado para unidade 102 recebe 403 Forbidden")
    void residentCannotCreateIncidentForOtherUnit() throws Exception {
        String body = """
                {
                    "unitId": "%s",
                    "title": "Vazamento no vizinho",
                    "description": "Tentando criar chamado na unidade 102",
                    "category": "PLUMBING",
                    "priority": "HIGH"
                }
                """.formatted(unit102Id);

        mockMvc.perform(post("/api/v1/incidents")
                        .header("Authorization", "Bearer " + resident101Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("Access Denied"));
    }
}
