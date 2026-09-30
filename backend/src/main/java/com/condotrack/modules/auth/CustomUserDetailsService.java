package com.condotrack.modules.auth;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Maps roles with double aliases so that CONCIERGE also receives ROLE_PORTARIA,
     * PORTARIA also receives ROLE_CONCIERGE, RESIDENT also receives ROLE_MORADOR,
     * and MORADOR also receives ROLE_RESIDENT.
     */
    public static List<SimpleGrantedAuthority> getAuthoritiesForRole(Role role) {
        if (role == null) {
            return List.of();
        }
        return switch (role) {
            case ADMIN -> List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
            case CONCIERGE -> List.of(
                new SimpleGrantedAuthority("ROLE_CONCIERGE"),
                new SimpleGrantedAuthority("ROLE_PORTARIA")
            );
            case PORTARIA -> List.of(
                new SimpleGrantedAuthority("ROLE_PORTARIA"),
                new SimpleGrantedAuthority("ROLE_CONCIERGE")
            );
            case RESIDENT -> List.of(
                new SimpleGrantedAuthority("ROLE_RESIDENT"),
                new SimpleGrantedAuthority("ROLE_MORADOR")
            );
            case MORADOR -> List.of(
                new SimpleGrantedAuthority("ROLE_MORADOR"),
                new SimpleGrantedAuthority("ROLE_RESIDENT")
            );
        };
    }
}