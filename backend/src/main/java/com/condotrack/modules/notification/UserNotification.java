package com.condotrack.modules.notification;

import com.condotrack.modules.auth.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Persistent in-app notification entity for critical operational events (FR-20).
 */
@Entity
@Table(name = "user_notifications")
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 30)
    private String module;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected UserNotification() {}

    public UserNotification(User user, String title, String message, String module) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.module = module;
        this.isRead = false;
        this.createdAt = OffsetDateTime.now();
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getModule() {
        return module;
    }

    public boolean isRead() {
        return isRead;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
