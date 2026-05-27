package com.example.pharmacy.controller;

import com.example.pharmacy.dto.AuthResponse;
import com.example.pharmacy.dto.LoginRequest;
import com.example.pharmacy.dto.RegisterRequest;
import com.example.pharmacy.entity.Role;
import com.example.pharmacy.entity.User;
import com.example.pharmacy.repository.UserRepository;
import com.example.pharmacy.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req){
        try {
            // Debug: Check if user exists
            var userOpt = userRepo.findByUsername(req.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found: " + req.getUsername());
            }
            
            var user = userOpt.get();
            
            // Debug: Check password match
            boolean passwordMatches = encoder.matches(req.getPassword(), user.getPassword());
            if (!passwordMatches) {
                return ResponseEntity.status(401).body("Password does not match for user: " + req.getUsername());
            }
            
            // Try authentication
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
            
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Authentication failed: " + e.getMessage());
        }
    }
    
    // Debug endpoint to test if user exists
    @GetMapping("/test-user/{username}")
    public ResponseEntity<?> testUser(@PathVariable String username) {
        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok("User '" + username + "' not found in database");
        }
        var user = userOpt.get();
        return ResponseEntity.ok("User found: " + user.getUsername() + ", Role: " + user.getRole().name());
    }
    
    // Helper endpoint to create admin user with correct password
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        // Delete existing admin if exists
        userRepo.findByUsername("admin").ifPresent(userRepo::delete);
        
        // Create new admin with proper hash
        String hashedPassword = encoder.encode("123456");
        User admin = User.builder()
            .username("admin")
            .email("admin@pharmacy.com")
            .password(hashedPassword)
            .role(Role.ADMIN)
            .build();
        userRepo.save(admin);
        
        return ResponseEntity.ok("Admin user created successfully with password: 123456");
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req){
        if(userRepo.existsByUsername(req.getUsername())) return ResponseEntity.badRequest().body("Username already exists");
        if(userRepo.existsByEmail(req.getEmail())) return ResponseEntity.badRequest().body("Email already exists");
        User u = User.builder().username(req.getUsername()).email(req.getEmail()).password(encoder.encode(req.getPassword())).role(Role.CUSTOMER).build();
        userRepo.save(u);
        return ResponseEntity.ok("Registered");
    }
}
