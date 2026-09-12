package com.condotrack.modules.auth;

import java.util.List;
import java.util.UUID;

public record AuthUserResponse(
    UUID id,
    String name,
    String email,
    Role role,
    List<UUID> units
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), List.of());
    }
}