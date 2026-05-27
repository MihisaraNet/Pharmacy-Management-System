package com.example.pharmacy.repository;
import com.example.pharmacy.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);
  boolean existsByUsername(String username);
  boolean existsByEmail(String email);
}
