// src/main/java/com/example/pharmacy/repository/DeliveryRepository.java
package com.example.pharmacy.repository;

import com.example.pharmacy.entity.Delivery;
import com.example.pharmacy.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    // Find deliveries by sale
    List<Delivery> findBySale(Sale sale);


    // Find deliveries by status
    List<Delivery> findByStatus(com.example.pharmacy.entity.DeliveryStatus status);
}
