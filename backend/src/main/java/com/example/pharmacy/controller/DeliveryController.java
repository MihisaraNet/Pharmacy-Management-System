// src/main/java/com/example/pharmacy/controller/DeliveryController.java
package com.example.pharmacy.controller;

import com.example.pharmacy.entity.Delivery;
import com.example.pharmacy.entity.DeliveryStatus;
import com.example.pharmacy.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "http://localhost:3000") // Enable CORS
public class DeliveryController {

    @Autowired
    private DeliveryService service;

    // Create new delivery
    @PreAuthorize("hasRole('ADMIN')") // Re-enabled security
    @PostMapping
    public ResponseEntity<Delivery> create(@RequestParam Long saleId, @RequestParam String address) {
        try {
            Delivery delivery = service.create(saleId, address);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            System.err.println("❌ Error creating delivery: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update existing delivery
    @PreAuthorize("hasRole('ADMIN')") // Re-enabled security
    @PutMapping("/{id}")
    public ResponseEntity<Delivery> update(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String address) {
        try {
            DeliveryStatus deliveryStatus = status != null ? DeliveryStatus.valueOf(status.toUpperCase()) : null;
            Delivery delivery = service.update(id, deliveryStatus, address);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            System.err.println("❌ Error updating delivery: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all deliveries
    @PreAuthorize("hasRole('ADMIN')") // Re-enabled security
    @GetMapping
    public ResponseEntity<List<Delivery>> all() {
        try {
            List<Delivery> deliveries = service.all();
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            System.err.println("❌ Error fetching deliveries: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get delivery by ID
    @PreAuthorize("hasRole('ADMIN')") // Re-enabled security
    @GetMapping("/{id}")
    public ResponseEntity<Delivery> get(@PathVariable Long id) {
        try {
            Delivery delivery = service.get(id);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            System.err.println("❌ Error fetching delivery: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete delivery
    @PreAuthorize("hasRole('ADMIN')") // Re-enabled security
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("❌ Error deleting delivery: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get deliveries by status (additional endpoint)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Delivery>> getByStatus(@PathVariable String status) {
        try {
            DeliveryStatus deliveryStatus = DeliveryStatus.valueOf(status.toUpperCase());
            List<Delivery> deliveries = service.getDeliveriesByStatus(deliveryStatus);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            System.err.println("❌ Error fetching deliveries by status: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
