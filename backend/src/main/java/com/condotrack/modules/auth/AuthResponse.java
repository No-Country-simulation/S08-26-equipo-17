package com.condotrack.modules.auth;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    AuthUserResponse user
) {
    public static AuthResponse from(User user, String accessToken, String refreshToken, long expiresIn) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, AuthUserResponse.from(user));
    }
}