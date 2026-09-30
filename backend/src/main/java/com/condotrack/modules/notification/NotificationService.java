package com.condotrack.modules.notification;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.notification.NotificationDtos.NotificationResponse;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling email notifications and persistent in-app notifications (FR-20).
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final JavaMailSender mailSender;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;

    public NotificationService(JavaMailSender mailSender) {
        this(mailSender, null, null);
    }

    @Autowired
    public NotificationService(@Autowired(required = false) JavaMailSender mailSender,
                               UserNotificationRepository userNotificationRepository,
                               UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userNotificationRepository = userNotificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Saves a persistent in-app notification for the recipient (FR-20).
     */
    @Transactional
    public void sendInAppNotification(User recipient, String title, String message, String module) {
        if (recipient == null) {
            log.warn("Cannot send in-app notification: recipient is null");
            return;
        }
        if (userNotificationRepository == null) {
            log.warn("UserNotificationRepository not configured; skipping in-app notification.");
            return;
        }
        UserNotification notification = new UserNotification(recipient, title, message, module);
        userNotificationRepository.save(notification);
        log.info("In-app notification created for user {} [{}]: {}", recipient.getEmail(), module, title);
    }

    /**
     * Retrieves all persistent notifications for the authenticated user, newest first.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForCurrentUser() {
        User user = currentUser();
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(NotificationResponse::from)
            .toList();
    }

    /**
     * Marks an in-app notification as read.
     */
    @Transactional
    public NotificationResponse markAsRead(UUID id) {
        User user = currentUser();
        UserNotification notification = userNotificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to update this notification");
        }

        notification.markAsRead();
        UserNotification saved = userNotificationRepository.save(notification);
        log.info("Notification {} marked as read for user {}", id, user.getEmail());
        return NotificationResponse.from(saved);
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        String email = authentication.getName();
        if (userRepository == null) {
            throw new ResourceNotFoundException("UserRepository not configured");
        }
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + email));
    }

    /** Sends an email without blocking the package registration request. */
    @Async
    public void notifyPackageArrived(List<String> recipientEmails, String carrierName,
                                     String trackingCode, String unitNumber) {
        if (recipientEmails == null || recipientEmails.isEmpty()) {
            log.info("No resident e-mails for unit {}; skipping package notification.", unitNumber);
            return;
        }
        try {
            if (mailSender != null) {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(recipientEmails.toArray(new String[0]));
                msg.setSubject("\uD83D\uDCE6 Sua encomenda da " + carrierName + " chegou na portaria!");
                msg.setText("Olá! Uma encomenda (" + trackingCode + ") para a unidade " + unitNumber
                    + " foi recebida na portaria. Retire-a em breve. Transportadora: " + carrierName + ".");
                mailSender.send(msg);
                log.info("Package notification sent to {}", recipientEmails);
            }
        } catch (Exception e) {
            log.warn("Could not send package e-mail (Mailpit offline?): {}", e.getMessage());
        }
    }

    /** Sends a password reset email with the reset token and instructions (FR-03). */
    @Async
    public void sendPasswordResetEmail(String recipientEmail, String resetToken) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.info("No recipient e-mail provided; skipping password reset email.");
            return;
        }
        try {
            if (mailSender != null) {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(recipientEmail);
                msg.setSubject("Recuperação de Senha - CondoTrack");
                msg.setText("Olá! Uma solicitação de recuperação de senha foi recebida para sua conta no CondoTrack.\n\n"
                    + "Seu token de recuperação é: " + resetToken + "\n\n"
                    + "Este token é válido por 15 minutos.\n"
                    + "Se você não solicitou a alteração da sua senha, por favor ignore este e-mail.");
                mailSender.send(msg);
                log.info("Password reset email sent to {}", recipientEmail);
            } else {
                log.warn("JavaMailSender not available (Mailpit offline?). Reset token for {}: {}", recipientEmail, resetToken);
            }
        } catch (Exception e) {
            log.warn("Could not send password reset e-mail (Mailpit offline?): {}", e.getMessage());
        }
    }
}
