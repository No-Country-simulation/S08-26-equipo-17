package com.condotrack.modules.incident;

import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentDtos.CreateIncidentRequest;
import com.condotrack.modules.resident.RelationshipType;
import com.condotrack.modules.resident.UserUnit;
import com.condotrack.modules.resident.UserUnitRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:incident_e2e_lifecycle_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
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
public class IncidentEndToEndLifecycleTest {

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserUnitRepository userUnitRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private Building building;
    private Unit unit101;
    private Unit unit102;

    private User resident101;
    private User resident102;
    private User admin;
    private User portaria;

    private String resident101Token;
    private String resident102Token;
    private String adminToken;
    private String portariaToken;

    @BeforeEach
    void setUp() {
        cleanData();

        building = buildingRepository.save(new Building("Condomínio Jardins", "Rua das Palmeiras, 500", 15));
        unit101 = unitRepository.save(new Unit(building, "Torre A", "101", 1));
        unit102 = unitRepository.save(new Unit(building, "Torre A", "102", 1));

        String encodedPassword = passwordEncoder.encode("secret123");
        resident101 = userRepository.save(new User("Morador 101", "morador101@condotrack.com", encodedPassword, "11988880101", Role.RESIDENT));
        resident102 = userRepository.save(new User("Morador 102", "morador102@condotrack.com", encodedPassword, "11988880102", Role.RESIDENT));
        admin = userRepository.save(new User("Síndico Admin", "admin.incidents@condotrack.com", encodedPassword, "11988880001", Role.ADMIN));
        portaria = userRepository.save(new User("Portaria Operador", "portaria.incidents@condotrack.com", encodedPassword, "11988880002", Role.PORTARIA));

        userUnitRepository.save(new UserUnit(resident101, unit101, RelationshipType.OWNER, true));
        userUnitRepository.save(new UserUnit(resident102, unit102, RelationshipType.TENANT, true));

        resident101Token = jwtService.generateAccessToken(resident101);
        resident102Token = jwtService.generateAccessToken(resident102);
        adminToken = jwtService.generateAccessToken(admin);
        portariaToken = jwtService.generateAccessToken(portaria);
    }

    @AfterEach
    void tearDown() throws IOException {
        cleanData();

        Path uploadDir = Paths.get("uploads", "incidents");
        if (Files.exists(uploadDir)) {
            try (var stream = Files.walk(uploadDir)) {
                stream.sorted(Comparator.reverseOrder())
                      .map(Path::toFile)
                      .forEach(File::delete);
            }
        }
    }

    private void cleanData() {
        auditLogRepository.deleteAll();
        incidentRepository.deleteAll();
        userUnitRepository.deleteAll();
        unitRepository.deleteAll();
        buildingRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Ciclo Completo E2E: Upload -> Criação de Chamado -> Download Autorizado -> Bloqueio 403 Vizinho -> Bloqueio 401 Anônimo")
    void testCompleteIncidentLifecycleEndToEnd() throws Exception {
        // ---------------------------------------------------------------------
        // 1. Upload: Morador da Unidade 101 faz upload de uma imagem válida
        // ---------------------------------------------------------------------
        byte[] expectedImageBytes = "conteudo-binario-foto-infiltracao-unidade-101".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile multipartFile = new MockMultipartFile(
            "file",
            "infiltracao_teto.jpg",
            "image/jpeg",
            expectedImageBytes
        );

        String uploadResponseJson = mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(multipartFile)
                .header("Authorization", "Bearer " + resident101Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.startsWith("/api/v1/incidents/photos/")))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.endsWith(".jpg")))
                .andExpect(jsonPath("$.data.originalFilename").value("infiltracao_teto.jpg"))
                .andReturn().getResponse().getContentAsString();

        String photoUrl = JsonPath.read(uploadResponseJson, "$.data.photoUrl");
        assertThat(photoUrl).isNotBlank();

        // ---------------------------------------------------------------------
        // 2. Criação do Chamado: Morador da Unidade 101 abre o chamado usando a photoUrl
        // ---------------------------------------------------------------------
        CreateIncidentRequest createReq = new CreateIncidentRequest(
            unit101.getId(),
            "Infiltração grave no teto",
            "Mancha de umidade visível gotejando próximo ao lustre da sala.",
            photoUrl,
            IncidentCategory.PLUMBING,
            IncidentPriority.HIGH
        );

        String createIncidentJson = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/incidents")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + resident101Token)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Infiltração grave no teto"))
                .andExpect(jsonPath("$.photoUrl").value(photoUrl))
                .andExpect(jsonPath("$.unitId").value(unit101.getId().toString()))
                .andReturn().getResponse().getContentAsString();

        String incidentId = JsonPath.read(createIncidentJson, "$.id");
        assertThat(incidentId).isNotBlank();

        // ---------------------------------------------------------------------
        // 3. Visualização Autorizada pelo Criador: Morador da Unidade 101 acessa a foto
        // ---------------------------------------------------------------------
        MvcResult residentResult = mockMvc.perform(MockMvcRequestBuilders.get(photoUrl)
                .header("Authorization", "Bearer " + resident101Token))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Cache-Control", "private, max-age=3600"))
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.IMAGE_JPEG))
                .andReturn();

        assertThat(residentResult.getResponse().getContentAsByteArray()).isEqualTo(expectedImageBytes);

        // ---------------------------------------------------------------------
        // 4. Visualização Autorizada pela Administração: ADMIN e PORTARIA acessam a mesma foto
        // ---------------------------------------------------------------------
        MvcResult adminResult = mockMvc.perform(MockMvcRequestBuilders.get(photoUrl)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Cache-Control", "private, max-age=3600"))
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.IMAGE_JPEG))
                .andReturn();

        assertThat(adminResult.getResponse().getContentAsByteArray()).isEqualTo(expectedImageBytes);

        MvcResult portariaResult = mockMvc.perform(MockMvcRequestBuilders.get(photoUrl)
                .header("Authorization", "Bearer " + portariaToken))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Cache-Control", "private, max-age=3600"))
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.IMAGE_JPEG))
                .andReturn();

        assertThat(portariaResult.getResponse().getContentAsByteArray()).isEqualTo(expectedImageBytes);

        // ---------------------------------------------------------------------
        // 5. Bloqueio de Terceiros (IDOR): Morador da Unidade 102 tenta acessar foto da Unidade 101
        // ---------------------------------------------------------------------
        mockMvc.perform(MockMvcRequestBuilders.get(photoUrl)
                .header("Authorization", "Bearer " + resident102Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Access Denied"));

        // ---------------------------------------------------------------------
        // 6. Bloqueio Anônimo: Requisição sem header Authorization tenta acessar a foto
        // ---------------------------------------------------------------------
        mockMvc.perform(MockMvcRequestBuilders.get(photoUrl))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Tentativa de download de arquivo inexistente retorna HTTP 404 Not Found")
    void nonExistentPhotoReturnsNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/incidents/photos/non-existent-photo.jpg")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource Not Found"));
    }

    @Test
    @DisplayName("Tentativa de Directory Traversal no endpoint de fotos é bloqueada com erro 4xx")
    void directoryTraversalAttemptIsBlocked() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/incidents/photos/..%2F..%2Fetc%2Fpasswd")
                .header("Authorization", "Bearer " + resident101Token))
                .andExpect(status().isBadRequest());
    }
}
