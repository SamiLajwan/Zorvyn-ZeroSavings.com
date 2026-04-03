package com.finance.dashboard.service;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public List<Dto.UserResponse> getAll() {
        return userRepo.findAll().stream().map(Dto.UserResponse::from).toList();
    }

    public Dto.UserResponse getById(Long id) {
        return Dto.UserResponse.from(findOrThrow(id));
    }

    public Dto.UserResponse create(Dto.CreateUserRequest req) {
        if (userRepo.existsByUsername(req.username))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.email))
            throw new IllegalArgumentException("Email already registered");
        User user = new User();
        user.setUsername(req.username);
        user.setPassword(encoder.encode(req.password));
        user.setEmail(req.email);
        user.setRole(req.role != null ? req.role : User.Role.VIEWER);
        return Dto.UserResponse.from(userRepo.save(user));
    }

    public Dto.UserResponse update(Long id, Dto.UpdateUserRequest req) {
        User user = findOrThrow(id);
        if (req.email != null) user.setEmail(req.email);
        if (req.role != null) user.setRole(req.role);
        if (req.status != null) user.setStatus(req.status);
        return Dto.UserResponse.from(userRepo.save(user));
    }

    public void delete(Long id) {
        userRepo.delete(findOrThrow(id));
    }

    private User findOrThrow(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }
}
