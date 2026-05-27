// src/main/java/com/example/pharmacy/repository/SaleRepository.java
package com.example.pharmacy.repository;

import com.example.pharmacy.entity.Sale;
import com.example.pharmacy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Use EntityGraph to fetch all related data in one query
    @EntityGraph("Sale.withItemsAndUser")
    List<Sale> findAll();

    // Use EntityGraph for finding by ID
    @EntityGraph("Sale.withItemsAndUser")
    Optional<Sale> findById(Long id);

    // Find sales by user with join fetch
    @Query("SELECT s FROM Sale s " +
            "LEFT JOIN FETCH s.user u " +
            "LEFT JOIN FETCH s.items si " +
            "LEFT JOIN FETCH si.medicine m " +
            "LEFT JOIN FETCH s.delivery d " +
            "WHERE s.user = :user " +
            "ORDER BY s.saleDate DESC")
    List<Sale> findByUser(@Param("user") User user);

    // Find sales within date range with join fetch
    @Query("SELECT s FROM Sale s " +
            "LEFT JOIN FETCH s.user u " +
            "LEFT JOIN FETCH s.items si " +
            "LEFT JOIN FETCH si.medicine m " +
            "LEFT JOIN FETCH s.delivery d " +
            "WHERE s.saleDate BETWEEN :start AND :end " +
            "ORDER BY s.saleDate DESC")
    List<Sale> findBySaleDateBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Get all sales with optimized fetching
    @Query("SELECT s FROM Sale s " +
            "LEFT JOIN FETCH s.user u " +
            "LEFT JOIN FETCH s.items si " +
            "LEFT JOIN FETCH si.medicine m " +
            "LEFT JOIN FETCH s.delivery d " +
            "ORDER BY s.saleDate DESC")
    List<Sale> findAllWithDetails();
}
