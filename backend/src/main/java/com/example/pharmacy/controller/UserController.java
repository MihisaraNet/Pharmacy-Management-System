package com.example.pharmacy.controller;

import com.example.pharmacy.entity.Role;
import com.example.pharmacy.entity.User;
import com.example.pharmacy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
  
  @Autowired 
  private UserService service;

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping 
  public ResponseEntity<User> create(@RequestBody User u) { 
    try {
      User createdUser = service.create(u.getUsername(), u.getEmail(), u.getPassword(), u.getRole());
      return ResponseEntity.ok(createdUser);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping 
  public List<User> all() { 
    return service.all(); 
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/{id}") 
  public User get(@PathVariable Long id) { 
    return service.find(id).orElseThrow();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}") 
  public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User u) {
    try {
      User updatedUser = service.update(id, u.getUsername(), u.getEmail(), u.getPassword(), u.getRole());
      return ResponseEntity.ok(updatedUser);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}") 
  public ResponseEntity<String> delete(@PathVariable Long id) {
    try {
      service.delete(id);
      return ResponseEntity.ok("User deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error: " + e.getMessage());
    }
  }
}
