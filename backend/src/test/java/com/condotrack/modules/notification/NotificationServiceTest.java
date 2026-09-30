package com.condotrack.modules.notification;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.notification.NotificationDtos.NotificationResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private UserNotificationRepository userNotificationRepository;

    @Mock
    private UserRepository userRepository;

    private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(mailSender, userNotificationRepository, userRepository);
        testUser = new User("Morador Teste", "morador@teste.com", "hash", "11999998888", Role.RESIDENT);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("sendInAppNotification should persist notification with correct fields")
    void sendInAppNotificationPersistsNotification() {
        notificationService.sendInAppNotification(testUser, "Título Notificação", "Mensagem de teste", "PACKAGE");

        ArgumentCaptor<UserNotification> captor = ArgumentCaptor.forClass(UserNotification.class);
        verify(userNotificationRepository).save(captor.capture());

        UserNotification saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(testUser);
        assertThat(saved.getTitle()).isEqualTo("Título Notificação");
        assertThat(saved.getMessage()).isEqualTo("Mensagem de teste");
        assertThat(saved.getModule()).isEqualTo("PACKAGE");
        assertThat(saved.isRead()).isFalse();
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("getNotificationsForCurrentUser returns notifications for authenticated user")
    void getNotificationsForCurrentUserReturnsList() {
        var auth = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserNotification n1 = new UserNotification(testUser, "Aviso 1", "Mensagem 1", "MOVE");
        UserNotification n2 = new UserNotification(testUser, "Aviso 2", "Mensagem 2", "MAINTENANCE");

        when(userNotificationRepository.findByUserIdOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(List.of(n1, n2));

        List<NotificationResponse> list = notificationService.getNotificationsForCurrentUser();

        assertThat(list).hasSize(2);
        assertThat(list.get(0).title()).isEqualTo("Aviso 1");
        assertThat(list.get(1).title()).isEqualTo("Aviso 2");
    }

    @Test
    @DisplayName("markAsRead should update isRead flag to true")
    void markAsReadUpdatesFlag() {
        var auth = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID notifId = UUID.randomUUID();
        UserNotification n = new UserNotification(testUser, "Aviso", "Corpo", "RESERVATION");
        when(userNotificationRepository.findById(notifId)).thenReturn(Optional.of(n));
        when(userNotificationRepository.save(any(UserNotification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(notifId);

        assertThat(response.isRead()).isTrue();
        assertThat(n.isRead()).isTrue();
        verify(userNotificationRepository).save(n);
    }

    @Test
    @DisplayName("markAsRead throws AccessDeniedException when notification belongs to another user")
    void markAsReadOtherUserThrowsAccessDenied() {
        var auth = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        User anotherUser = new User("Outro", "outro@teste.com", "hash", null, Role.RESIDENT);
        UUID notifId = UUID.randomUUID();
        UserNotification n = new UserNotification(anotherUser, "Aviso", "Corpo", "RESERVATION");
        when(userNotificationRepository.findById(notifId)).thenReturn(Optional.of(n));

        assertThatThrownBy(() -> notificationService.markAsRead(notifId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You are not allowed to update this notification");
    }

    @Test
    @DisplayName("markAsRead throws ResourceNotFoundException when notification not found")
    void markAsReadNotFoundThrowsException() {
        var auth = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID notifId = UUID.randomUUID();
        when(userNotificationRepository.findById(notifId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(notifId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Notification not found: " + notifId);
    }
}
