package com.condotrack.modules.notification;

import com.condotrack.modules.notification.NotificationDtos.NotificationResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller exposing persistent in-app notifications endpoints (FR-20).
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Retrieves in-app notifications for the currently authenticated user (FR-20).
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<NotificationResponse> listNotifications() {
        return notificationService.getNotificationsForCurrentUser();
    }

    /**
     * Marks a specific notification as read (FR-20).
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public NotificationResponse markAsRead(@PathVariable UUID id) {
        return notificationService.markAsRead(id);
    }
}
