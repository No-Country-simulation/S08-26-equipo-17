package com.condotrack.acceptance;

import com.condotrack.modules.access.*;
import com.condotrack.modules.access.AccessDtos.CreateAuthorizationRequest;
import com.condotrack.modules.access.AccessDtos.ValidateQrRequest;
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
import com.condotrack.modules.incident.*;
import com.condotrack.modules.move.*;
import com.condotrack.modules.parcel.*;
import com.condotrack.modules.parcel.PackageDtos.DeliverPackageRequest;
import com.condotrack.modules.parcel.PackageDtos.RegisterPackageRequest;
import com.condotrack.modules.reservation.*;
import com.condotrack.modules.reservation.ReservationDtos.CreateReservationRequest;
import com.condotrack.modules.resident.RelationshipType;
import com.condotrack.modules.resident.UserUnit;
import com.condotrack.modules.resident.UserUnitRepository;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Suíte de Testes de Aceitação End-to-End (E2E) do CondoTrack.
 *
 * <p>Comprova de forma irrefutável os 4 Critérios de Aceitação (Definition of Done)
 * documentados em {@code docs/requirements.md}:</p>
 * <ol>
 *   <li><b>Critério 1 (Visão 360° e Isolamento):</b> Dossiê completo da unidade e proteção contra acesso indevido (403 Forbidden).</li>
 *   <li><b>Critério 2 (Check-in QR em &lt; 1.5s):</b> Emissão, validação em portaria, registro em log e SLA &lt; 1500 ms.</li>
 *   <li><b>Critério 3 (Ciclo de Encomendas):</b> Recepção pela portaria, visibilidade pelo morador e baixa presencial com carimbo do operador.</li>
 *   <li><b>Critério 4 (Bloqueio de Conflito de Reservas):</b> Concorrência real com 1 sucesso (201) e 1 conflito (409).</li>
 * </ol>
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:acceptance_e2e_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
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
public class AcceptanceCriteriaE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JavaMailSender mailSender;

    // Repositories
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserUnitRepository userUnitRepository;

    @Autowired
    private CommonAreaRepository commonAreaRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PackageDeliveryRepository packageDeliveryRepository;

    @Autowired
    private AccessAuthorizationRepository accessAuthorizationRepository;

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private MoveRepository moveRepository;

    // Shared Fixtures
    private Building building;
    private Unit unit101;
    private Unit unit102;
    private User adminUser;
    private User conciergeUser;
    private User resident101User;
    private User resident102User;
    private CommonArea commonAreaGourmet;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        // 1. Building
        building = buildingRepository.save(new Building("Edifício Solar das Palmeiras", "Av. Paulista, 1000", 20));

        // 2. Units
        unit101 = unitRepository.save(new Unit(building, "Torre A", "101", 1));
        unit102 = unitRepository.save(new Unit(building, "Torre A", "102", 1));

        // 3. Users com diferentes papéis RBAC
        String encodedPass = passwordEncoder.encode("password123");
        adminUser = userRepository.save(new User("Carlos Administrador", "admin@condotrack.com", encodedPass, "+5511999990001", Role.ADMIN));
        conciergeUser = userRepository.save(new User("Roberto Portaria", "portaria@condotrack.com", encodedPass, "+5511999990002", Role.CONCIERGE));
        resident101User = userRepository.save(new User("Mariana Moradora 101", "mariana101@condotrack.com", encodedPass, "+5511999990003", Role.RESIDENT));
        resident102User = userRepository.save(new User("Lucas Morador 102", "lucas102@condotrack.com", encodedPass, "+5511999990004", Role.RESIDENT));

        // 4. Vinculação Unidade-Morador (Garante isolamento estrito)
        userUnitRepository.save(new UserUnit(resident101User, unit101, RelationshipType.OWNER, true));
        userUnitRepository.save(new UserUnit(resident102User, unit102, RelationshipType.TENANT, true));

        // 5. Área Comum para reservas
        commonAreaGourmet = createCommonArea("Churrasqueira Gourmet", building);
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        accessLogRepository.deleteAll();
        accessAuthorizationRepository.deleteAll();
        packageDeliveryRepository.deleteAll();
        reservationRepository.deleteAll();
        moveRepository.deleteAll();
        incidentRepository.deleteAll();
        auditLogRepository.deleteAll();
        userUnitRepository.deleteAll();
        unitRepository.deleteAll();
        commonAreaRepository.deleteAll();
        buildingRepository.deleteAll();
        userRepository.deleteAll();
    }

    // =========================================================================
    // Helpers de Autenticação (JWT)
    // =========================================================================

    public String tokenForAdmin() {
        return jwtService.generateAccessToken(adminUser);
    }

    public String tokenForConcierge() {
        return jwtService.generateAccessToken(conciergeUser);
    }

    public String tokenForResident(User resident) {
        return jwtService.generateAccessToken(resident);
    }

    public String tokenForResident101() {
        return tokenForResident(resident101User);
    }

    public String tokenForResident102() {
        return tokenForResident(resident102User);
    }

    // =========================================================================
    // Helper de Criação de Entidades
    // =========================================================================

    private CommonArea createCommonArea(String name, Building b) {
        try {
            var constructor = CommonArea.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            CommonArea area = constructor.newInstance();
            ReflectionTestUtils.setField(area, "name", name);
            ReflectionTestUtils.setField(area, "building", b);
            ReflectionTestUtils.setField(area, "maxCapacity", 20);
            ReflectionTestUtils.setField(area, "openTime", LocalTime.of(8, 0));
            ReflectionTestUtils.setField(area, "closeTime", LocalTime.of(23, 0));
            ReflectionTestUtils.setField(area, "active", true);
            return commonAreaRepository.save(area);
        } catch (Exception ex) {
            throw new RuntimeException("Falha ao instanciar CommonArea", ex);
        }
    }

    // =========================================================================
    // CRITÉRIO 1: Visão 360° e Isolamento de Dados
    // =========================================================================
    @Test
    @DisplayName("Critério 1: Dossiê 360° completo da unidade e isolamento rigoroso entre moradores (403 Forbidden)")
    void criterio1_visao360EIsolamento() throws Exception {
        // Popula massa representativa para a Unidade 101 comprovando dossiê 360°
        packageDeliveryRepository.save(new PackageDelivery(
                unit101, conciergeUser, PackageType.PARCEL, "Amazon Prime", "AMZ-E2E-101"
        ));

        accessLogRepository.save(new AccessLog(
                null, unit101, "Visitante Familiar", "11122233344", AccessDirection.ENTRY, conciergeUser, "Visita permitida"
        ));

        reservationRepository.save(new Reservation(
                commonAreaGourmet, unit101, resident101User,
                OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusDays(2).plusHours(3)
        ));

        incidentRepository.save(new IncidentTicket(
                building, unit101, resident101User,
                "Vazamento na torneira", "Vazamento na pia da cozinha", null,
                IncidentCategory.PLUMBING, IncidentPriority.MEDIUM
        ));

        moveRepository.save(new MoveSchedule(
                unit101, resident101User, MoveType.IN, LocalDate.now().plusDays(15), MoveShift.MORNING
        ));

        auditLogRepository.save(new AuditLog(
                building.getId(), unit101.getId(), resident101User.getId(),
                AuditModule.UNIT, "UNIT_VERIFIED", "Inspeção semestral realizada", "{}"
        ));

        // 1. Morador da própria unidade acessa dossiê 360° com sucesso (200 OK)
        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForResident101()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.id").value(unit101.getId().toString()))
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"))
                .andExpect(jsonPath("$.data.unit.buildingName").value("Edifício Solar das Palmeiras"))
                .andExpect(jsonPath("$.data.residents[0].name").value("Mariana Moradora 101"))
                .andExpect(jsonPath("$.data.residents[0].relationshipType").value("OWNER"))
                .andExpect(jsonPath("$.data.pendingPackages[0].trackingCode").value("AMZ-E2E-101"))
                .andExpect(jsonPath("$.data.recentAccesses[0].visitorName").value("Visitante Familiar"))
                .andExpect(jsonPath("$.data.upcomingReservations[0].commonAreaName").value("Churrasqueira Gourmet"))
                .andExpect(jsonPath("$.data.openIncidents[0].title").value("Vazamento na torneira"))
                .andExpect(jsonPath("$.data.scheduledMove.moveType").value("IN"))
                .andExpect(jsonPath("$.data.recentAuditTimeline[0].action").value("UNIT_VERIFIED"));

        // 2. Administrador e Portaria também conseguem visualizar o dossiê 360° (200 OK)
        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"));

        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForConcierge()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unit.numberCode").value("101"));

        // 3. Isolamento: Morador da Unidade 102 tentando acessar a Unidade 101 recebe 403 Forbidden
        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForResident102()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("Access Denied"))
                .andExpect(jsonPath("$.detail").value("Morador não tem permissão para visualizar dados de outra unidade"));
    }

    // =========================================================================
    // CRITÉRIO 2: Check-in QR em < 1.5s e Registro de Acesso
    // =========================================================================
    @Test
    @DisplayName("Critério 2: Emissão de QR por morador, validação pela portaria com SLA < 1.5s e log de auditoria")
    void criterio2_checkInQrPerformanceERegistroLog() throws Exception {
        // Passo 1: Morador 101 emite autorização para visitante (201 Created)
        OffsetDateTime now = OffsetDateTime.now();
        CreateAuthorizationRequest authReq = new CreateAuthorizationRequest(
                unit101.getId(),
                "Eng. Felipe Visitante",
                "123.456.789-99",
                now.minusMinutes(10),
                now.plusHours(4)
        );

        MvcResult authResult = mockMvc.perform(post("/api/v1/access/authorizations")
                        .header("Authorization", "Bearer " + tokenForResident101())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tokenCode").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        JsonNode authJson = objectMapper.readTree(authResult.getResponse().getContentAsString());
        String tokenCode = authJson.get("tokenCode").asText();
        assertTrue(tokenCode.startsWith("AUTH-QR-"), "Token gerado deve ter formato padronizado AUTH-QR-");

        // Passo 2: Portaria valida o QR code medindo o tempo de resposta
        ValidateQrRequest qrReq = new ValidateQrRequest(tokenCode);

        long start = System.currentTimeMillis();
        MvcResult qrResult = mockMvc.perform(post("/api/v1/access/validate-qr")
                        .header("Authorization", "Bearer " + tokenForConcierge())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(qrReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorized").value(true))
                .andExpect(jsonPath("$.visitorName").value("Eng. Felipe Visitante"))
                .andExpect(jsonPath("$.unitNumber").value("101"))
                .andExpect(jsonPath("$.residentName").value("Mariana Moradora 101"))
                .andReturn();
        long duration = System.currentTimeMillis() - start;

        // Validação estrita do SLA do Critério 2: tempo de resposta < 1500 ms
        assertTrue(duration < 1500, "Validação do QR deve responder estritamente em menos de 1500ms. Tempo real: " + duration + "ms");

        // Passo 3: Comprovação do registro em AccessLog
        List<AccessLog> logs = accessLogRepository.findByUnitIdOrderByTimestampDesc(unit101.getId());
        assertFalse(logs.isEmpty(), "Registro de acesso deve estar persistido no banco");
        AccessLog accessLog = logs.stream()
                .filter(l -> "Eng. Felipe Visitante".equals(l.getVisitorName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Log de acesso do visitante não encontrado"));

        assertEquals(AccessDirection.ENTRY, accessLog.getDirection());
        assertEquals("123.456.789-99", accessLog.getVisitorDocument());
        assertNotNull(accessLog.getCheckedBy(), "Operador de portaria deve estar registrado");
        assertEquals(conciergeUser.getId(), accessLog.getCheckedBy().getId());
        User logOperator = userRepository.findById(accessLog.getCheckedBy().getId()).orElseThrow();
        assertEquals("Roberto Portaria", logOperator.getName());

        // Passo 4: Confirma que o convite foi consumido (USED) e não pode ser reutilizado
        AccessAuthorization authDb = accessAuthorizationRepository.findByTokenCode(tokenCode).orElseThrow();
        assertEquals(AuthorizationStatus.USED, authDb.getStatus());
    }

    // =========================================================================
    // CRITÉRIO 3: Ciclo Completo de Encomendas
    // =========================================================================
    @Test
    @DisplayName("Critério 3: Ciclo de Encomenda: recebimento na portaria, morador vê como pendente, baixa com carimbo do operador")
    void criterio3_cicloDeEncomendas() throws Exception {
        // Passo 1: Recebimento pela portaria (POST /api/v1/packages -> 201 Created)
        String trackingCode = "BR-PAC-884422";
        RegisterPackageRequest registerReq = new RegisterPackageRequest(
                unit101.getId(),
                "Correios Sedex",
                trackingCode,
                PackageType.PARCEL
        );

        MvcResult regResult = mockMvc.perform(post("/api/v1/packages")
                        .header("Authorization", "Bearer " + tokenForConcierge())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.trackingCode").value(trackingCode))
                .andExpect(jsonPath("$.carrierName").value("Correios Sedex"))
                .andExpect(jsonPath("$.status").value("PENDING_PICKUP"))
                .andReturn();

        JsonNode regJson = objectMapper.readTree(regResult.getResponse().getContentAsString());
        UUID packageId = UUID.fromString(regJson.get("id").asText());

        // Passo 2: Morador vê a encomenda como pendente na Visão 360° da sua unidade
        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForResident101()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pendingPackages[?(@.trackingCode == '" + trackingCode + "')]").exists())
                .andExpect(jsonPath("$.data.pendingPackages[?(@.carrierName == 'Correios Sedex')]").exists());

        // Portaria também enxerga a encomenda na listagem geral de pendências
        mockMvc.perform(get("/api/v1/packages/pending")
                        .header("Authorization", "Bearer " + tokenForConcierge()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.trackingCode == '" + trackingCode + "')]").exists());

        // Passo 3: Baixa presencial pela portaria (PATCH /api/v1/packages/{id}/deliver -> 200 OK)
        DeliverPackageRequest deliverReq = new DeliverPackageRequest("Mariana Moradora 101");

        mockMvc.perform(patch("/api/v1/packages/" + packageId + "/deliver")
                        .header("Authorization", "Bearer " + tokenForConcierge())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deliverReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.pickedUpByName").value("Mariana Moradora 101"))
                .andExpect(jsonPath("$.pickedUpAt").isNotEmpty());

        // Passo 4: Validação irrefutável no banco com carimbo do operador
        PackageDelivery deliveredPkg = packageDeliveryRepository.findById(packageId).orElseThrow();
        assertEquals(PackageStatus.DELIVERED, deliveredPkg.getStatus());
        assertEquals("Mariana Moradora 101", deliveredPkg.getPickedUpByName());
        assertNotNull(deliveredPkg.getPickedUpAt());
        assertNotNull(deliveredPkg.getPickupOperator(), "Carimbo do operador de portaria deve estar preenchido");
        assertEquals(conciergeUser.getId(), deliveredPkg.getPickupOperator().getId());
        User pkgOperator = userRepository.findById(deliveredPkg.getPickupOperator().getId()).orElseThrow();
        assertEquals("Roberto Portaria", pkgOperator.getName());

        // Passo 5: Morador visualiza que a encomenda não consta mais como pendente
        mockMvc.perform(get("/api/v1/units/" + unit101.getId() + "/overview-360")
                        .header("Authorization", "Bearer " + tokenForResident101()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pendingPackages[?(@.trackingCode == '" + trackingCode + "')]").doesNotExist());
    }

    // =========================================================================
    // CRITÉRIO 4: Bloqueio de Conflito de Reservas Concorrentes
    // =========================================================================
    @Test
    @DisplayName("Critério 4: Concorrência real: 2 solicitações simultâneas para o mesmo espaço resultam em 1 sucesso (201) e 1 conflito (409)")
    void criterio4_bloqueioDeConflitoDeReservas() throws Exception {
        // Horário idêntico disputado por dois moradores diferentes
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(3).withHour(18).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endTime = startTime.plusHours(4);

        CreateReservationRequest req1 = new CreateReservationRequest(
                commonAreaGourmet.getId(),
                unit101.getId(),
                startTime,
                endTime
        );

        CreateReservationRequest req2 = new CreateReservationRequest(
                commonAreaGourmet.getId(),
                unit102.getId(),
                startTime,
                endTime
        );

        String body1 = objectMapper.writeValueAsString(req1);
        String body2 = objectMapper.writeValueAsString(req2);

        String token1 = tokenForResident101();
        String token2 = tokenForResident102();

        // Configuração de concorrência com CountDownLatch e ExecutorService
        int numberOfThreads = 2;
        ExecutorService pool = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                readyLatch.countDown();
                startLatch.await();
                return mockMvc.perform(post("/api/v1/reservations")
                                .header("Authorization", "Bearer " + token1)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body1))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            } catch (Exception e) {
                throw new RuntimeException("Erro na Thread 1", e);
            }
        }, pool);

        CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> {
            try {
                readyLatch.countDown();
                startLatch.await();
                return mockMvc.perform(post("/api/v1/reservations")
                                .header("Authorization", "Bearer " + token2)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body2))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            } catch (Exception e) {
                throw new RuntimeException("Erro na Thread 2", e);
            }
        }, pool);

        // Aguarda ambas as threads estarem prontas e libera o disparo simultâneo
        boolean ready = readyLatch.await(5, TimeUnit.SECONDS);
        assertTrue(ready, "Ambas as threads deveriam estar prontas para disparo");
        startLatch.countDown();

        // Coleta os status HTTP das duas requisições
        int status1 = future1.get(15, TimeUnit.SECONDS);
        int status2 = future2.get(15, TimeUnit.SECONDS);
        pool.shutdown();

        List<Integer> statuses = List.of(status1, status2);

        // Asserção fundamental do Critério 4: exatamente 1 sucesso (201) e 1 conflito (409)
        assertThat(statuses)
                .as("Uma requisição deve ser confirmada (201) e a concorrente rejeitada por conflito (409)")
                .containsExactlyInAnyOrder(201, 409);

        // Validação no banco: exatamente 1 reserva gravada com status CONFIRMED para o intervalo
        List<Reservation> confirmedReservations = reservationRepository
                .findByCommonAreaIdAndStatusOrderByStartTimeAsc(commonAreaGourmet.getId(), ReservationStatus.CONFIRMED);

        assertEquals(1, confirmedReservations.size(), "Deve existir exatamente 1 reserva gravada no banco");
        Reservation savedReservation = confirmedReservations.get(0);
        assertEquals(commonAreaGourmet.getId(), savedReservation.getCommonArea().getId());
        assertEquals(ReservationStatus.CONFIRMED, savedReservation.getStatus());
        assertEquals(startTime.toInstant(), savedReservation.getStartTime().toInstant());
    }
}
