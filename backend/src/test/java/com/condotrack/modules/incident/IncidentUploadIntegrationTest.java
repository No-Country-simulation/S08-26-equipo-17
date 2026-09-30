package com.condotrack.modules.incident;

import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.io.File;
import java.io.IOException;
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
    "spring.datasource.url=jdbc:h2:mem:incident_upload_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
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
class IncidentUploadIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private JavaMailSender mailSender;

    private User residentUser;
    private String residentToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        residentUser = userRepository.save(new User("Morador Teste", "morador.upload@condotrack.com", "hash", "11988887777", Role.RESIDENT));
        residentToken = jwtService.generateAccessToken(residentUser);
    }

    @AfterEach
    void tearDown() throws IOException {
        userRepository.deleteAll();
        Path uploadDir = Paths.get("uploads", "incidents");
        if (Files.exists(uploadDir)) {
            try (var stream = Files.walk(uploadDir)) {
                stream.sorted(Comparator.reverseOrder())
                      .map(Path::toFile)
                      .forEach(File::delete);
            }
        }
    }

    @Test
    @DisplayName("Upload bem-sucedido de imagem JPEG retorna HTTP 201 e a URL do arquivo")
    void uploadJpegSuccess() throws Exception {
        byte[] content = "fake-jpeg-binary-content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "vazamento.jpg",
            "image/jpeg",
            content
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(file)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.startsWith("/api/v1/incidents/photos/")))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.endsWith(".jpg")))
                .andExpect(jsonPath("$.data.originalFilename").value("vazamento.jpg"))
                .andExpect(jsonPath("$.data.size").value(content.length))
                .andExpect(jsonPath("$.data.contentType").value("image/jpeg"));
    }

    @Test
    @DisplayName("Upload bem-sucedido de imagem PNG retorna HTTP 201 e a URL do arquivo")
    void uploadPngSuccess() throws Exception {
        byte[] content = "fake-png-binary-content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "rachadura.png",
            "image/png",
            content
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(file)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.startsWith("/api/v1/incidents/photos/")))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.endsWith(".png")))
                .andExpect(jsonPath("$.data.originalFilename").value("rachadura.png"))
                .andExpect(jsonPath("$.data.size").value(content.length))
                .andExpect(jsonPath("$.data.contentType").value("image/png"));
    }

    @Test
    @DisplayName("Upload bem-sucedido de imagem WEBP retorna HTTP 201 e a URL do arquivo")
    void uploadWebpSuccess() throws Exception {
        byte[] content = "fake-webp-binary-content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "lampada.webp",
            "image/webp",
            content
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(file)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.startsWith("/api/v1/incidents/photos/")))
                .andExpect(jsonPath("$.data.photoUrl").value(org.hamcrest.Matchers.endsWith(".webp")))
                .andExpect(jsonPath("$.data.originalFilename").value("lampada.webp"))
                .andExpect(jsonPath("$.data.contentType").value("image/webp"));
    }

    @Test
    @DisplayName("Rejeição de arquivo vazio retorna HTTP 400 Bad Request")
    void uploadEmptyFileReturnsBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "vazio.jpg",
            "image/jpeg",
            new byte[0]
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(emptyFile)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Photo file cannot be empty."));
    }

    @Test
    @DisplayName("Rejeição de tipo inválido text/plain retorna HTTP 400 Bad Request")
    void uploadInvalidTextPlainReturnsBadRequest() throws Exception {
        MockMultipartFile textFile = new MockMultipartFile(
            "file",
            "documento.txt",
            "text/plain",
            "Conteúdo de texto puro não permitido".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(textFile)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid photo format. Supported formats: image/jpeg, image/png, image/webp"));
    }

    @Test
    @DisplayName("Rejeição de tipo inválido application/pdf retorna HTTP 400 Bad Request")
    void uploadInvalidPdfReturnsBadRequest() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
            "file",
            "relatorio.pdf",
            "application/pdf",
            "%PDF-1.4...".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(pdfFile)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid photo format. Supported formats: image/jpeg, image/png, image/webp"));
    }

    @Test
    @DisplayName("Tentativa de upload sem autenticação retorna HTTP 401 Unauthorized")
    void uploadWithoutAuthenticationReturnsUnauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "vazamento.jpg",
            "image/jpeg",
            "conteudo".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Tentativa de acesso anônimo à foto retorna HTTP 401 Unauthorized (RNF-03)")
    void unauthenticatedAccessToPhotoReturnsUnauthorized() throws Exception {
        byte[] content = "test-image-bytes".getBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "evidencia.jpg",
            "image/jpeg",
            content
        );

        String responseJson = mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/incidents/upload")
                .file(file)
                .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String photoUrl = com.jayway.jsonpath.JsonPath.read(responseJson, "$.data.photoUrl");

        // Anonymous access without JWT must return 401 Unauthorized
        mockMvc.perform(MockMvcRequestBuilders.get(photoUrl))
                .andExpect(status().isUnauthorized());

        // Direct static route /uploads/** must also be blocked without authentication (401 Unauthorized)
        mockMvc.perform(MockMvcRequestBuilders.get("/uploads/incidents/evidencia.jpg"))
                .andExpect(status().isUnauthorized());
    }
}
