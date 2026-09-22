package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestly.nestly_backend.dto.LoginRequest;
import com.nestly.nestly_backend.dto.LoginResponse;
import com.nestly.nestly_backend.dto.RegisterRequest;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AuthController(authService))
            .build();

    @Test
    void registerUser_shouldReturn201() throws Exception {

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password@123");

        User user = mock(User.class);

        when(user.getId()).thenReturn(100L);
        when(user.getName()).thenReturn("Test User");
        when(user.getEmail()).thenReturn("test@example.com");
        when(user.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(user);

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void loginUser_shouldReturn200AndToken() throws Exception {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password@123");

        LoginResponse response = new LoginResponse(
                "test-jwt-token",
                100L,
                "Test User",
                "test@example.com"
        );

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt-token"))
                .andExpect(jsonPath("$.userId").value(100))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void registerUser_withInvalidEmail_shouldReturn400() throws Exception {

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("invalid-email");
        request.setPassword("Password@123");

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest());
    }
}