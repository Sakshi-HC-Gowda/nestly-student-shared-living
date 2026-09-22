package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.LoginRequest;
import com.nestly.nestly_backend.dto.LoginResponse;
import com.nestly.nestly_backend.dto.RegisterRequest;
import com.nestly.nestly_backend.dto.RegisterResponse;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/test")
    public String testAuth() {
        return "Auth endpoint is public!";
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return new RegisterResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);

    }

}