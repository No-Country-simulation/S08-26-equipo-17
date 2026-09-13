package com.condotrack.config;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.condotrack.modules.auth.CustomUserDetailsService;
import com.condotrack.modules.auth.JwtAuthenticationFilter;
import com.condotrack.modules.auth.JwtService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that each role can only open its own doors (endpoints).
 *
 * <p>Beginner note: we fake (mock) the user database, create a real JWT for a
 * fake user, and then ask: "does this token get 200 OK or 403 Forbidden?"</p>
 */
@WebMvcTest(TestProtectedController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, JwtAuthenticationFilter.class})
@TestPropertySource(properties = {
    "app.security.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nw==",
    "app.security.jwt.expiration-ms=3600000",
    "app.security.jwt.refresh-expiration-ms=604800000",
    "app.cors.allowed-origins=http://localhost:3000"
})
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    // Test accounts, one per role + one disabled account.
    private User admin;
    private User concierge;
    private User resident;
    private User inactive;

    private static User buildUser(String email, Role role, boolean active) {
        try {
            var constructor = User.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            User user = constructor.newInstance();
            ReflectionTestUtils.setField(user, "id", UUID.randomUUID());
            ReflectionTestUtils.setField(user, "name", email);
            ReflectionTestUtils.setField(user, "email", email);
            ReflectionTestUtils.setField(user, "passwordHash", "hash");
            ReflectionTestUtils.setField(user, "role", role);
            ReflectionTestUtils.setField(user, "active", active);
            return user;
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot instantiate test User", ex);
        }
    }

    @BeforeEach
    void setUp() {
        admin = buildUser("admin@condotrack.com", Role.ADMIN, true);
        concierge = buildUser("concierge@condotrack.com", Role.CONCIERGE, true);
        resident = buildUser("resident@condotrack.com", Role.RESIDENT, true);
        inactive = buildUser("inactive@condotrack.com", Role.RESIDENT, false);
    }

    private void mockUser(User user) throws Exception {
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(user);
    }

    @Test
    @DisplayName("5. Protected endpoint without token returns 401")
    void protectedEndpointWithoutTokenIs401() throws Exception {
        mockMvc.perform(get("/api/v1/incidents/test")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/access/authorizations")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/packages/tracking")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Malformed token results in unauthenticated access (401)")
    void malformedTokenIs401() throws Exception {
        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer not-a-jwt"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Refresh token cannot access protected endpoint (401)")
    void refreshTokenCannotAccessProtectedEndpoint() throws Exception {
        mockUser(resident);
        String refresh = jwtService.generateRefreshToken(resident);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + refresh))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6a. RESIDENT can access resident operations")
    void residentCanAccessResidentOperations() throws Exception {
        mockUser(resident);
        String token = jwtService.generateAccessToken(resident);

        mockMvc.perform(get("/api/v1/access/authorizations").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6b. CONCIERGE can access front-desk/package and audit operations")
    void conciergeCanAccessConciergeOperations() throws Exception {
        mockUser(concierge);
        String token = jwtService.generateAccessToken(concierge);

        mockMvc.perform(get("/api/v1/packages/tracking").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit-logs/list").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6c. Authenticated user can access generic endpoint")
    void authenticatedUserAccessesGenericEndpoint() throws Exception {
        mockUser(resident);
        String token = jwtService.generateAccessToken(resident);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("7a. CONCIERGE cannot access resident operations (403)")
    void conciergeForbiddenOnResidentOperations() throws Exception {
        mockUser(concierge);
        String token = jwtService.generateAccessToken(concierge);

        mockMvc.perform(get("/api/v1/access/authorizations").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("7b. RESIDENT cannot access front-desk or audit operations (403)")
    void residentForbiddenOnConciergeOperations() throws Exception {
        mockUser(resident);
        String token = jwtService.generateAccessToken(resident);

        mockMvc.perform(get("/api/v1/packages/tracking").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/audit-logs/list").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Inactive user cannot access protected endpoint (401)")
    void inactiveUserCannotAccessProtectedEndpoint() throws Exception {
        mockUser(inactive);
        String token = jwtService.generateAccessToken(inactive);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + token))
            .andExpect(status().isUnauthorized());
    }
}
