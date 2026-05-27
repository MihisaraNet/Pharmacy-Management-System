package com.example.pharmacy.service;

import com.example.pharmacy.entity.Role;
import com.example.pharmacy.entity.User;
import com.example.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
  
  @Autowired 
  private UserRepository repo;
  
  @Autowired 
  private PasswordEncoder encoder;

  public User create(String username, String email, String password, Role role) {
    User user = new User();
    user.setUsername(username);
    user.setEmail(email);
    user.setPassword(encoder.encode(password));
    user.setRole(role);
    return repo.save(user);
  }
  
  public List<User> all() { 
    return repo.findAll(); 
  }
  
  public Optional<User> find(Long id) { 
    return repo.findById(id); 
  }
  
  public void delete(Long id) { 
    repo.deleteById(id); 
  }
  
  public User update(Long id, String username, String email, String password, Role role) {
    User user = repo.findById(id).orElseThrow();
    if (username != null && !username.trim().isEmpty()) {
      user.setUsername(username);
    }
    if (email != null && !email.trim().isEmpty()) {
      user.setEmail(email);
    }
    if (password != null && !password.trim().isEmpty()) {
      user.setPassword(encoder.encode(password));
    }
    if (role != null) {
      user.setRole(role);
    }
    return repo.save(user);
  }
}
