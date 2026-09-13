package com.condotrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;

import com.condotrack.modules.auth.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectProvider<JwtAuthenticationFilter> jwtAuthenticationFilter;

    public SecurityConfig(ObjectProvider<JwtAuthenticationFilter> jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // This is a stateless REST API: the client sends the JWT with every request.
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Return standard HTTP status codes instead of redirecting to an HTML login page.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler(new AccessDeniedHandlerImpl())
            )
            .authorizeHttpRequests(auth -> auth
                // Health checks and API documentation are intentionally public.
                .requestMatchers(
                    "/api/v1/health",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml"
                ).permitAll()
                // Authentication endpoints must be reachable before the user has a token.
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
                // hasAnyRole automatically looks for authorities such as ROLE_ADMIN.
                // ADMIN + RESIDENT can create guest passes, amenity bookings and move requests.
                .requestMatchers("/api/v1/access/authorizations", "/api/v1/reservations/**", "/api/v1/moves/**")
                    .hasAnyRole("ADMIN", "RESIDENT")
                // ADMIN + CONCIERGE (front desk) validate entries and handle packages.
                .requestMatchers("/api/v1/access/**", "/api/v1/packages/**")
                    .hasAnyRole("ADMIN", "CONCIERGE")
                .requestMatchers("/api/v1/audit-logs/**").hasAnyRole("ADMIN", "CONCIERGE")
                .anyRequest().authenticated()
            );

        JwtAuthenticationFilter filter = jwtAuthenticationFilter.getIfAvailable();
        if (filter != null) {
            // Read the JWT before Spring's username/password authentication filter runs.
            http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Passwords are stored as BCrypt hashes, never as plain text.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
