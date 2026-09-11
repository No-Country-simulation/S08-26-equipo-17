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

    private User admin;
    private User portaria;
    private User morador;
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
        portaria = buildUser("portaria@condotrack.com", Role.PORTARIA, true);
        morador = buildUser("morador@condotrack.com", Role.MORADOR, true);
        inactive = buildUser("inativo@condotrack.com", Role.MORADOR, false);
    }

    private void mockUser(User user) throws Exception {
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(user);
    }

    @Test
    @DisplayName("5. Endpoint protegido sem token retorna 401")
    void protectedEndpointWithoutTokenIs401() throws Exception {
        mockMvc.perform(get("/api/v1/incidents/test")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/access/authorizations")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/packages/tracking")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token malformado resulta em acesso não autenticado (401)")
    void malformedTokenIs401() throws Exception {
        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer not-a-jwt"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Refresh token não acessa endpoint protegido (401)")
    void refreshTokenCannotAccessProtectedEndpoint() throws Exception {
        mockUser(morador);
        String refresh = jwtService.generateRefreshToken(morador);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + refresh))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6a. MORADOR acessa operações de moradores")
    void moradorCanAccessResidentOperations() throws Exception {
        mockUser(morador);
        String token = jwtService.generateAccessToken(morador);

        mockMvc.perform(get("/api/v1/access/authorizations").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6b. PORTARIA acessa operações de portaria/pacotes e auditoria")
    void portariaCanAccessPortariaOperations() throws Exception {
        mockUser(portaria);
        String token = jwtService.generateAccessToken(portaria);

        mockMvc.perform(get("/api/v1/packages/tracking").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/audit-logs/list").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6c. Usuário autenticado acessa endpoint genérico")
    void authenticatedUserAccessesGenericEndpoint() throws Exception {
        mockUser(morador);
        String token = jwtService.generateAccessToken(morador);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("7a. PORTARIA não acessa operações de moradores (403)")
    void portariaForbiddenOnResidentOperations() throws Exception {
        mockUser(portaria);
        String token = jwtService.generateAccessToken(portaria);

        mockMvc.perform(get("/api/v1/access/authorizations").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("7b. MORADOR não acessa operações de portaria nem auditoria (403)")
    void moradorForbiddenOnPortariaOperations() throws Exception {
        mockUser(morador);
        String token = jwtService.generateAccessToken(morador);

        mockMvc.perform(get("/api/v1/packages/tracking").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/audit-logs/list").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Usuário inativo não acessa endpoint protegido (401)")
    void inactiveUserCannotAccessProtectedEndpoint() throws Exception {
        mockUser(inactive);
        String token = jwtService.generateAccessToken(inactive);

        mockMvc.perform(get("/api/v1/incidents/test").header("Authorization", "Bearer " + token))
            .andExpect(status().isUnauthorized());
    }
}
