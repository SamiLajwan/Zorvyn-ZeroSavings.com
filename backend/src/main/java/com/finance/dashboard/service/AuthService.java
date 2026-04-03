package com.finance.dashboard.service;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.UserRepository;
import com.finance.dashboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public Dto.AuthResponse login(Dto.LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
        return new Dto.AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public Dto.AuthResponse register(Dto.CreateUserRequest req) {
        if (userRepo.existsByUsername(req.username))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.email))
            throw new IllegalArgumentException("Email already registered");
        User user = new User();
        user.setUsername(req.username);
        user.setPassword(encoder.encode(req.password));
        user.setEmail(req.email);
        user.setRole(req.role != null ? req.role : User.Role.VIEWER);
        userRepo.save(user);
        String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
        return new Dto.AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}
