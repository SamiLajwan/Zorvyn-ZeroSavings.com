package com.finance.dashboard.controller;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Dto.AuthResponse> login(@Valid @RequestBody Dto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<Dto.AuthResponse> register(@Valid @RequestBody Dto.CreateUserRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }
}
