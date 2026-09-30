package com.condotrack.modules.notification;

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
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:notification_test_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "app.security.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
})
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtService jwtService;

    private User residentUser;
    private User otherResident;
    private String residentToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        userNotificationRepository.deleteAll();
        userRepository.deleteAll();

        residentUser = userRepository.save(new User("Morador A", "moradorA@condotrack.com", "hash", "11988880001", Role.RESIDENT));
        otherResident = userRepository.save(new User("Morador B", "moradorB@condotrack.com", "hash", "11988880002", Role.RESIDENT));

        residentToken = jwtService.generateAccessToken(residentUser);
        otherToken = jwtService.generateAccessToken(otherResident);
    }

    @AfterEach
    void tearDown() {
        userNotificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/v1/notifications returns notifications for authenticated user")
    void listNotificationsReturnsOnlyCurrentUserNotifications() throws Exception {
        notificationService.sendInAppNotification(residentUser, "Pacote Chegou", "Retire na portaria", "PACKAGE");
        notificationService.sendInAppNotification(residentUser, "Mudança Agendada", "Mudança aprovada", "MOVE");
        notificationService.sendInAppNotification(otherResident, "Outro Usuário", "Não deve aparecer", "RESERVATION");

        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + residentToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Mudança Agendada"))
                .andExpect(jsonPath("$[0].module").value("MOVE"))
                .andExpect(jsonPath("$[0].isRead").value(false))
                .andExpect(jsonPath("$[1].title").value("Pacote Chegou"))
                .andExpect(jsonPath("$[1].module").value("PACKAGE"));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read marks notification as read")
    void markAsReadUpdatesNotification() throws Exception {
        notificationService.sendInAppNotification(residentUser, "Reserva", "Reserva confirmada", "RESERVATION");
        var list = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(residentUser.getId());
        assertThat(list).hasSize(1);
        var notification = list.get(0);
        assertThat(notification.isRead()).isFalse();

        mockMvc.perform(patch("/api/v1/notifications/" + notification.getId() + "/read")
                        .header("Authorization", "Bearer " + residentToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(notification.getId().toString()))
                .andExpect(jsonPath("$.isRead").value(true));

        var updated = userNotificationRepository.findById(notification.getId()).orElseThrow();
        assertThat(updated.isRead()).isTrue();
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read returns 403 Forbidden when accessing other user's notification")
    void markAsReadOtherUserNotificationReturnsForbidden() throws Exception {
        notificationService.sendInAppNotification(residentUser, "Segredo", "Mensagem do Morador A", "AUTH");
        var list = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(residentUser.getId());
        var notification = list.get(0);

        mockMvc.perform(patch("/api/v1/notifications/" + notification.getId() + "/read")
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/notifications returns 401 Unauthorized without JWT token")
    void listNotificationsUnauthenticatedReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
