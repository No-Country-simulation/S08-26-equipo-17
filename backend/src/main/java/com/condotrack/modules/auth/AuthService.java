package com.condotrack.modules.auth;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.notification.NotificationService;
import io.jsonwebtoken.JwtException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final com.condotrack.modules.resident.UserUnitRepository userUnitRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService
    ) {
        this(authenticationManager, userRepository, jwtService, null, null, null, null);
    }

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService,
        com.condotrack.modules.resident.UserUnitRepository userUnitRepository
    ) {
        this(authenticationManager, userRepository, jwtService, userUnitRepository, null, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService,
        com.condotrack.modules.resident.UserUnitRepository userUnitRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        NotificationService notificationService,
        PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userUnitRepository = userUnitRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()) {
            return;
        }
        userRepository.findByEmailIgnoreCase(request.email().trim())
            .ifPresent(user -> {
                String token = UUID.randomUUID().toString();
                OffsetDateTime expiryDate = OffsetDateTime.now().plusMinutes(15);
                PasswordResetToken resetToken = new PasswordResetToken(user, token, expiryDate);
                if (passwordResetTokenRepository != null) {
                    passwordResetTokenRepository.save(resetToken);
                }
                if (notificationService != null) {
                    notificationService.sendPasswordResetEmail(user.getEmail(), token);
                }
            });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null || request.token() == null || request.token().isBlank()) {
            throw new ResourceNotFoundException("Token inválido");
        }
        if (passwordResetTokenRepository == null) {
            throw new BusinessException("Password reset service unavailable");
        }
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Token de recuperação de senha não encontrado"));

        if (resetToken.isUsed()) {
            throw new BusinessException("Token de recuperação de senha já utilizado");
        }

        if (resetToken.isExpired()) {
            throw new BusinessException("Token de recuperação de senha expirado");
        }

        User user = resetToken.getUser();
        String encodedPassword = passwordEncoder != null
            ? passwordEncoder.encode(request.newPassword())
            : request.newPassword();
        user.updatePassword(encodedPassword);
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = findUser(request.email());
        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        try {
            if (!jwtService.isRefreshToken(request.refreshToken())) {
                throw new BadCredentialsException("Invalid refresh token");
            }
            User user = findUser(jwtService.extractUsername(request.refreshToken()));
            return issueTokens(user);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BadCredentialsException("Invalid refresh token", exception);
        }
    }

    public AuthUserResponse getCurrentUser(String email) {
        User user = findUser(email);
        java.util.List<java.util.UUID> unitIds = getLinkedUnitIds(user.getId());
        return AuthUserResponse.from(user, unitIds);
    }

    private java.util.List<java.util.UUID> getLinkedUnitIds(java.util.UUID userId) {
        if (userUnitRepository == null) return java.util.List.of();
        return userUnitRepository.findByUserId(userId).stream()
            .map(uu -> uu.getUnit().getId())
            .toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .filter(User::isEnabled)
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    }

    private AuthResponse issueTokens(User user) {
        java.util.List<java.util.UUID> unitIds = getLinkedUnitIds(user.getId());
        return AuthResponse.from(
            user,
            unitIds,
            jwtService.generateAccessToken(user),
            jwtService.generateRefreshToken(user),
            jwtService.getAccessExpirationSeconds());
    }
}