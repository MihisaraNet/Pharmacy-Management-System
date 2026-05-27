package com.example.pharmacy.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // Generate multiple passwords
        String[] plainPasswords = {"password", "admin123", "user123", "test"};

        System.out.println("=== BCrypt Password Generation ===");
        for (String plainPassword : plainPasswords) {
            String hashedPassword = passwordEncoder.encode(plainPassword);
            System.out.println("Plain: '" + plainPassword + "' => BCrypt: '" + hashedPassword + "'");

            // Verify the password works
            boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
            System.out.println("Verification: " + matches);
            System.out.println("---");
        }
    }
}
