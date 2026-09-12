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

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
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

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .filter(User::isEnabled)
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    }

    private AuthResponse issueTokens(User user) {
        return AuthResponse.from(
            user,
            jwtService.generateAccessToken(user),
            jwtService.generateRefreshToken(user),
            jwtService.getAccessExpirationSeconds());
    }
}