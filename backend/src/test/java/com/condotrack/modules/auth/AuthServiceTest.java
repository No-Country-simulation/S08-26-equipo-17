package com.condotrack.modules.auth;

import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String SECRET = Base64.getEncoder()
        .encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 3600000L, 604800000L);
        authService = new AuthService(authenticationManager, userRepository, jwtService);
    }

    private User user(Role role, boolean active) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(user, "name", "Teste");
        ReflectionTestUtils.setField(user, "email", "teste@condotrack.com");
        ReflectionTestUtils.setField(user, "passwordHash", "hash");
        ReflectionTestUtils.setField(user, "role", role);
        ReflectionTestUtils.setField(user, "active", active);
        return user;
    }

    @Test
    @DisplayName("1. Login com credenciais válidas retorna access e refresh token")
    void loginWithValidCredentials() {
        User user = user(Role.MORADOR, true);
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(new LoginRequest("teste@condotrack.com", "password123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(jwtService.isAccessToken(response.accessToken())).isTrue();
        assertThat(jwtService.isRefreshToken(response.refreshToken())).isTrue();
    }

    @Test
    @DisplayName("2. Login com credenciais inválidas lança exceção de autenticação")
    void loginWithInvalidCredentials() {
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("teste@condotrack.com", "errada")))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("3. Refresh token válido emite novos tokens")
    void refreshWithValidToken() {
        User user = user(Role.PORTARIA, true);
        String refresh = jwtService.generateRefreshToken(user);
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));

        AuthResponse response = authService.refresh(new RefreshTokenRequest(refresh));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(jwtService.isAccessToken(response.accessToken())).isTrue();
    }

    @Test
    @DisplayName("4. Access token é rejeitado no endpoint de refresh")
    void refreshWithAccessTokenIsRejected() {
        User user = user(Role.MORADOR, true);
        String access = jwtService.generateAccessToken(user);

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(access)))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("8a. Usuário inativo não consegue fazer login")
    void inactiveUserCannotLogin() {
        User user = user(Role.MORADOR, false);
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("teste@condotrack.com", "password123")))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("8b. Usuário inativo não consegue renovar tokens")
    void inactiveUserCannotRefresh() {
        User active = user(Role.MORADOR, true);
        String refresh = jwtService.generateRefreshToken(active);
        User inactive = user(Role.MORADOR, false);
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(inactive));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(refresh)))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Refresh malformado é rejeitado")
    void refreshWithMalformedTokenIsRejected() {
        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("not-a-jwt")))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Conta desabilitada no AuthenticationManager impede login")
    void disabledAccountCannotLogin() {
        when(authenticationManager.authenticate(any()))
            .thenThrow(new DisabledException("User is disabled"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("teste@condotrack.com", "password123")))
            .isInstanceOf(DisabledException.class);
    }
}
