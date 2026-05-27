// src/main/java/com/example/pharmacy/controller/SaleController.java
package com.example.pharmacy.controller;

import com.example.pharmacy.dto.SaleItemRequest;
import com.example.pharmacy.dto.SaleRequest;
import com.example.pharmacy.entity.Sale;
import com.example.pharmacy.entity.SaleStatus;
import com.example.pharmacy.service.DeliveryService;
import com.example.pharmacy.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.pharmacy.repository.UserRepository;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private UserRepository userRepository;

    // Create a new sale
    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @PostMapping
    public ResponseEntity<Sale> create(@RequestBody SaleRequest request) {
        try {
            // Validate request
            if (request == null || !request.isValid()) {
                return ResponseEntity.badRequest().build();
            }

            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            // Find user by username
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            Sale sale = saleService.createSale(
                    user.getId(),
                    request.getMedicineIds(),
                    request.getQuantities()
            );

            return ResponseEntity.ok(sale);
        } catch (Exception e) {
            System.err.println("Error creating sale: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all sales (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Sale>> getAll() {
        try {
            List<Sale> sales = saleService.getAllSales();
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            System.err.println("Error getting all sales: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get sale by ID
    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<Sale> get(@PathVariable Long id) {
        try {
            Sale sale = saleService.getSaleById(id);
            return ResponseEntity.ok(sale);
        } catch (RuntimeException e) {
            System.err.println("Sale not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting sale: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update sale status
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Sale> updateStatus(@PathVariable Long id, @RequestParam("status") String status) {
        try {
            Sale updatedSale = saleService.updateSaleStatus(id, SaleStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(updatedSale);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid status: " + status);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.err.println("Sale not found for status update: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating sale status: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Cancel/Delete sale
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            saleService.cancelSale(id);
            return ResponseEntity.ok("Sale cancelled successfully and stock quantities restored");
        } catch (RuntimeException e) {
            System.err.println("Error cancelling sale: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error cancelling sale: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Internal server error cancelling sale: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }

    // Get sales for a specific user (Customer can see their own, Admin can see anyone's)
    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @GetMapping("/params")
    public ResponseEntity<List<Sale>> getSalesByUser(@RequestParam(required = false) Long userId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            // If no userId provided or user is not admin, get current user's sales
            if (userId == null || !auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                var user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username));
                userId = user.getId();
            }

            List<Sale> sales = saleService.getSalesByUserId(userId);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            System.err.println("Error getting sales by user: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
