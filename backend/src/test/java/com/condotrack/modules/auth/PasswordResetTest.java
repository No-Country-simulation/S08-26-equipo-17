package com.condotrack.modules.auth;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:password_reset_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.jackson.serialization.write-dates-as-timestamps=false",
    "app.security.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "app.security.jwt.expiration-ms=86400000",
    "app.security.jwt.refresh-expiration-ms=604800000"
})
class PasswordResetTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JavaMailSender mailSender;

    private User testUser;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User(
            "Carlos Morador",
            "carlos@condotrack.com",
            passwordEncoder.encode("senhaAntiga123"),
            "+5511999990001",
            Role.RESIDENT
        );
        userRepository.save(testUser);
    }

    @Nested
    @DisplayName("1. Role-Based Access Control (RBAC) Double Compatibility Tests")
    class RoleCompatibilityTests {

        @Test
        @DisplayName("CONCIERGE and PORTARIA roles have aliased authorities")
        void conciergeAndPortariaAuthorities() {
            var conciergeAuths = CustomUserDetailsService.getAuthoritiesForRole(Role.CONCIERGE);
            assertThat(conciergeAuths).contains(
                new SimpleGrantedAuthority("ROLE_CONCIERGE"),
                new SimpleGrantedAuthority("ROLE_PORTARIA")
            );

            var portariaAuths = CustomUserDetailsService.getAuthoritiesForRole(Role.PORTARIA);
            assertThat(portariaAuths).contains(
                new SimpleGrantedAuthority("ROLE_PORTARIA"),
                new SimpleGrantedAuthority("ROLE_CONCIERGE")
            );

            assertThat(Role.CONCIERGE.isConcierge()).isTrue();
            assertThat(Role.PORTARIA.isConcierge()).isTrue();
            assertThat(Role.CONCIERGE.isResident()).isFalse();
            assertThat(Role.PORTARIA.isResident()).isFalse();
        }

        @Test
        @DisplayName("RESIDENT and MORADOR roles have aliased authorities")
        void residentAndMoradorAuthorities() {
            var residentAuths = CustomUserDetailsService.getAuthoritiesForRole(Role.RESIDENT);
            assertThat(residentAuths).contains(
                new SimpleGrantedAuthority("ROLE_RESIDENT"),
                new SimpleGrantedAuthority("ROLE_MORADOR")
            );

            var moradorAuths = CustomUserDetailsService.getAuthoritiesForRole(Role.MORADOR);
            assertThat(moradorAuths).contains(
                new SimpleGrantedAuthority("ROLE_MORADOR"),
                new SimpleGrantedAuthority("ROLE_RESIDENT")
            );

            assertThat(Role.RESIDENT.isResident()).isTrue();
            assertThat(Role.MORADOR.isResident()).isTrue();
            assertThat(Role.RESIDENT.isConcierge()).isFalse();
            assertThat(Role.MORADOR.isConcierge()).isFalse();
        }

        @Test
        @DisplayName("ADMIN role has ROLE_ADMIN authority")
        void adminAuthorities() {
            var adminAuths = CustomUserDetailsService.getAuthoritiesForRole(Role.ADMIN);
            assertThat(adminAuths).containsExactly(new SimpleGrantedAuthority("ROLE_ADMIN"));
            assertThat(Role.ADMIN.isAdmin()).isTrue();
            assertThat(Role.ADMIN.isResident()).isFalse();
            assertThat(Role.ADMIN.isConcierge()).isFalse();
        }

        @Test
        @DisplayName("User entity delegates authorities to CustomUserDetailsService")
        void userEntityAuthoritiesDelegation() {
            User moradorUser = new User("Ana", "ana@condotrack.com", "hash", null, Role.MORADOR);
            assertThat(moradorUser.getAuthorities())
                .extracting(org.springframework.security.core.GrantedAuthority::getAuthority)
                .contains("ROLE_MORADOR", "ROLE_RESIDENT");

            User portariaUser = new User("Pedro", "pedro@condotrack.com", "hash", null, Role.PORTARIA);
            assertThat(portariaUser.getAuthorities())
                .extracting(org.springframework.security.core.GrantedAuthority::getAuthority)
                .contains("ROLE_PORTARIA", "ROLE_CONCIERGE");
        }
    }

    @Nested
    @DisplayName("2. Forgot Password Flow Tests (POST /api/v1/auth/forgot-password)")
    class ForgotPasswordTests {

        @Test
        @DisplayName("Existing email generates 15-minute token and sends transactional email")
        void forgotPasswordExistingEmail() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest("carlos@condotrack.com");

            mockMvc.perform(post("/api/v1/auth/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Se o e-mail estiver cadastrado, as instruções foram enviadas."));

            List<PasswordResetToken> tokens = tokenRepository.findAll();
            assertThat(tokens).hasSize(1);
            PasswordResetToken token = tokens.get(0);
            assertThat(token.getUser().getEmail()).isEqualTo("carlos@condotrack.com");
            assertThat(token.isUsed()).isFalse();
            assertThat(token.isExpired()).isFalse();
            assertThat(token.getExpiryDate()).isAfter(OffsetDateTime.now().plusMinutes(14));
            assertThat(token.getExpiryDate()).isBefore(OffsetDateTime.now().plusMinutes(16));

            verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        }

        @Test
        @DisplayName("Non-existing email returns 200 without generating token or sending email")
        void forgotPasswordNonExistingEmail() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest("desconhecido@condotrack.com");

            mockMvc.perform(post("/api/v1/auth/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Se o e-mail estiver cadastrado, as instruções foram enviadas."));

            List<PasswordResetToken> tokens = tokenRepository.findAll();
            assertThat(tokens).isEmpty();
            verify(mailSender, times(0)).send(any(SimpleMailMessage.class));
        }

        @Test
        @DisplayName("Invalid email format returns 400 with RFC 7807 problem details")
        void forgotPasswordInvalidEmail() throws Exception {
            String json = "{\"email\":\"email-invalido\"}";

            mockMvc.perform(post("/api/v1/auth/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://condotrack.com/errors/validation-error"))
                .andExpect(jsonPath("$.title").value("Invalid Input Data"));
        }

        @Test
        @DisplayName("Offline mail server does not cause request to fail (graceful degradation)")
        void forgotPasswordMailServerOffline() throws Exception {
            doThrow(new RuntimeException("Mailpit connection refused")).when(mailSender).send(any(SimpleMailMessage.class));

            ForgotPasswordRequest request = new ForgotPasswordRequest("carlos@condotrack.com");

            mockMvc.perform(post("/api/v1/auth/forgot-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Se o e-mail estiver cadastrado, as instruções foram enviadas."));

            List<PasswordResetToken> tokens = tokenRepository.findAll();
            assertThat(tokens).hasSize(1);
        }
    }

    @Nested
    @DisplayName("3. Reset Password Flow Tests (POST /api/v1/auth/reset-password)")
    class ResetPasswordTests {

        @Test
        @DisplayName("Valid token updates password with BCrypt, marks token as used, and permits login with new password")
        void resetPasswordSuccess() throws Exception {
            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                testUser,
                tokenValue,
                OffsetDateTime.now().plusMinutes(15)
            );
            tokenRepository.save(resetToken);

            ResetPasswordRequest request = new ResetPasswordRequest(tokenValue, "novaSenhaSuperSegura123");

            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Senha atualizada com sucesso."));

            PasswordResetToken updatedToken = tokenRepository.findByToken(tokenValue).orElseThrow();
            assertThat(updatedToken.isUsed()).isTrue();

            User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
            assertThat(passwordEncoder.matches("novaSenhaSuperSegura123", updatedUser.getPassword())).isTrue();
            assertThat(passwordEncoder.matches("senhaAntiga123", updatedUser.getPassword())).isFalse();

            LoginRequest loginWithNewPassword = new LoginRequest("carlos@condotrack.com", "novaSenhaSuperSegura123");
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginWithNewPassword)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());

            LoginRequest loginWithOldPassword = new LoginRequest("carlos@condotrack.com", "senhaAntiga123");
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginWithOldPassword)))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Non-existent token throws ResourceNotFoundException returning 404 with RFC 7807 problem details")
        void resetPasswordNonExistentToken() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest("token-inexistente-123", "novaSenha123");

            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://condotrack.com/errors/not-found"))
                .andExpect(jsonPath("$.title").value("Resource Not Found"))
                .andExpect(jsonPath("$.detail").value("Token de recuperação de senha não encontrado"));
        }

        @Test
        @DisplayName("Already used token throws BusinessException returning 400 with RFC 7807 problem details")
        void resetPasswordAlreadyUsedToken() throws Exception {
            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                testUser,
                tokenValue,
                OffsetDateTime.now().plusMinutes(15)
            );
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);

            ResetPasswordRequest request = new ResetPasswordRequest(tokenValue, "novaSenha123");

            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://condotrack.com/errors/bad-request"))
                .andExpect(jsonPath("$.title").value("Business Rule Violated"))
                .andExpect(jsonPath("$.detail").value("Token de recuperação de senha já utilizado"));
        }

        @Test
        @DisplayName("Expired token throws BusinessException returning 400 with RFC 7807 problem details")
        void resetPasswordExpiredToken() throws Exception {
            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                testUser,
                tokenValue,
                OffsetDateTime.now().minusMinutes(5)
            );
            tokenRepository.save(resetToken);

            ResetPasswordRequest request = new ResetPasswordRequest(tokenValue, "novaSenha123");

            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://condotrack.com/errors/bad-request"))
                .andExpect(jsonPath("$.title").value("Business Rule Violated"))
                .andExpect(jsonPath("$.detail").value("Token de recuperação de senha expirado"));
        }

        @Test
        @DisplayName("Validation fails when token or password is blank (400 RFC 7807)")
        void resetPasswordValidationFailsOnBlank() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest("", "");

            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://condotrack.com/errors/validation-error"))
                .andExpect(jsonPath("$.title").value("Invalid Input Data"));
        }
    }
}
