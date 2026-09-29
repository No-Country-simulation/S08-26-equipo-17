package com.condotrack.modules.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.JwtException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final com.condotrack.modules.resident.UserUnitRepository userUnitRepository;

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService
    ) {
        this(authenticationManager, userRepository, jwtService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService,
        com.condotrack.modules.resident.UserUnitRepository userUnitRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userUnitRepository = userUnitRepository;
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