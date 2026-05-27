package com.example.pharmacy.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateAdminPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        
        String plainPassword = "123456";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        System.out.println("=== ADMIN USER CREATION ===");
        System.out.println("Password: " + plainPassword);
        System.out.println("BCrypt Hash: " + hashedPassword);
        
        // Verify the hash works
        boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
        System.out.println("Verification Test: " + (matches ? "PASS" : "FAIL"));
        
        System.out.println("\n--- SQL INSERT Query ---");
        System.out.println("INSERT INTO users (username, password, email, role) VALUES");
        System.out.println("('admin', '" + hashedPassword + "', 'admin@pharmacy.com', 'ADMIN');");
        
        System.out.println("\n--- Alternative with some standard hashes ---");
        String[] standardHashes = {
            "$2a$10$abcdefghijklmnopqrstuu.DQhaxQqKmDyXTFDKdhKtF2mKqrxUwS", // 123456
            "$2a$10$N9qo8uLOickgx2ZMRZoMye.IcQrQDqhJE3aFNmVnRxlWvlp4ykI6W", // 123456  
            "$2a$10$Ek4v3XqFsYTc9z7ZMToVKOWHHJ9KqHwUqJLo3b6XjFXkJ4HlQoSv6"  // 123456
        };
        
        System.out.println("\nTesting standard BCrypt hashes for '123456':");
        for (int i = 0; i < standardHashes.length; i++) {
            boolean testMatch = passwordEncoder.matches("123456", standardHashes[i]);
            System.out.println("Hash " + (i + 1) + ": " + (testMatch ? "VALID" : "INVALID"));
            if (testMatch) {
                System.out.println("Use this hash: " + standardHashes[i]);
            }
        }
    }
}
