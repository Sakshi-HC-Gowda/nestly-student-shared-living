package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.LoginRequest;
import com.nestly.nestly_backend.dto.LoginResponse;
import com.nestly.nestly_backend.dto.RegisterRequest;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.exception.EmailAlreadyRegisteredException;
import com.nestly.nestly_backend.repository.UserRepository;
import com.nestly.nestly_backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final AuthService authService = new AuthService(userRepository, jwtService);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void registerSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("john@example.com");
        request.setPassword("Password123");

        User savedUser = new User();
        savedUser.setName("John");
        savedUser.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("John", result.getName());
        assertEquals("john@example.com", result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerThrowsEmailAlreadyRegisteredException() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("duplicate@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyRegisteredException.class, () ->
                authService.register(request)
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Password123");

        User user = new User();
        user.setEmail("john@example.com");
        user.setName("John");
        user.setPassword(encoder.encode("Password123"));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(), eq("john@example.com"))).thenReturn("valid-token");

        LoginResponse response = authService.login(request);

        assertEquals("valid-token", response.getToken());
        assertEquals("John", response.getName());
        assertEquals("john@example.com", response.getEmail());
    }

    @Test
    void loginThrowsWhenEmailNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("Password123");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    void loginThrowsWhenPasswordMismatch() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("WrongPassword");

        User user = new User();
        user.setEmail("john@example.com");
        user.setPassword(encoder.encode("CorrectPassword"));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }
}
