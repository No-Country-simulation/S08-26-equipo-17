package com.condotrack.modules.auth;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.test.web.servlet.MockMvc;

import com.condotrack.config.CorsConfig;
import com.condotrack.config.SecurityConfig;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    private static AuthResponse response() {
        return new AuthResponse("access-token", "refresh-token", "Bearer", 3600L,
            new AuthUserResponse(UUID.randomUUID(), "Test user", "test@condotrack.com", Role.RESIDENT, List.of()));
    }

    @Test
    @DisplayName("1. Login with valid credentials returns 200 with tokens")
    void loginValid() throws Exception {
        when(authService.login(any())).thenReturn(response());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@condotrack.com\",\"password\":\"password123\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("access-token"))
            .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    @DisplayName("2. Login with invalid credentials returns 401")
    void loginInvalid() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@condotrack.com\",\"password\":\"errada\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Valid refresh token returns 200 with new tokens")
    void refreshValid() throws Exception {
        when(authService.refresh(any())).thenReturn(response());

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"valid-refresh\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    @DisplayName("4. Access token at refresh endpoint returns 401")
    void refreshWithAccessToken() throws Exception {
        when(authService.refresh(any())).thenThrow(new BadCredentialsException("Invalid refresh token"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"access-token-value\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("8. Inactive user cannot authenticate (401)")
    void loginInactiveUser() throws Exception {
        when(authService.login(any())).thenThrow(new DisabledException("User is disabled"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"inactive@condotrack.com\",\"password\":\"password123\"}"))
            .andExpect(status().isUnauthorized());
    }
}
