package com.example.pharmacy.controller;

import com.example.pharmacy.dto.*;
import com.example.pharmacy.entity.ExpiryStatus;
import com.example.pharmacy.service.MedicineExpiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicine-expiry")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicineExpiryController {

    @Autowired
    private MedicineExpiryService medicineExpiryService;

    // Get all medicine expiry records
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MedicineExpiryResponse>> getAllMedicineExpiry() {
        List<MedicineExpiryResponse> medicineExpiries = medicineExpiryService.getAllMedicineExpiry();
        return ResponseEntity.ok(medicineExpiries);
    }

    // Get medicine expiry by ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<MedicineExpiryResponse> getMedicineExpiryById(@PathVariable Long id) {
        try {
            MedicineExpiryResponse medicineExpiry = medicineExpiryService.getMedicineExpiryById(id);
            return ResponseEntity.ok(medicineExpiry);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create new medicine expiry record
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MedicineExpiryResponse> createMedicineExpiry(@RequestBody MedicineExpiryRequest request) {
        try {
            MedicineExpiryResponse medicineExpiry = medicineExpiryService.createMedicineExpiry(request);
            return ResponseEntity.ok(medicineExpiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update medicine expiry record
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MedicineExpiryResponse> updateMedicineExpiry(@PathVariable Long id, @RequestBody MedicineExpiryRequest request) {
        try {
            MedicineExpiryResponse medicineExpiry = medicineExpiryService.updateMedicineExpiry(id, request);
            return ResponseEntity.ok(medicineExpiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete medicine expiry record
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicineExpiry(@PathVariable Long id) {
        try {
            medicineExpiryService.deleteMedicineExpiry(id);
            return ResponseEntity.ok("Medicine expiry record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get expired medicines
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expired")
    public ResponseEntity<List<MedicineExpiryResponse>> getExpiredMedicines() {
        List<MedicineExpiryResponse> expiredMedicines = medicineExpiryService.getExpiredMedicines();
        return ResponseEntity.ok(expiredMedicines);
    }

    // Get medicines expiring soon (within 30 days)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<MedicineExpiryResponse>> getMedicinesExpiringSoon() {
        List<MedicineExpiryResponse> expiringSoon = medicineExpiryService.getMedicinesExpiringSoon();
        return ResponseEntity.ok(expiringSoon);
    }

    // Get medicines near expiry (within 7 days)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/near-expiry")
    public ResponseEntity<List<MedicineExpiryResponse>> getMedicinesNearExpiry() {
        List<MedicineExpiryResponse> nearExpiry = medicineExpiryService.getMedicinesNearExpiry();
        return ResponseEntity.ok(nearExpiry);
    }

    // Get medicines by medicine ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<MedicineExpiryResponse>> getMedicineExpiryByMedicineId(@PathVariable Long medicineId) {
        List<MedicineExpiryResponse> medicineExpiries = medicineExpiryService.getMedicineExpiryByMedicineId(medicineId);
        return ResponseEntity.ok(medicineExpiries);
    }

    // Search medicine expiry records
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/search")
    public ResponseEntity<List<MedicineExpiryResponse>> searchMedicineExpiry(@RequestBody ExpirySearchRequest searchRequest) {
        List<MedicineExpiryResponse> results = medicineExpiryService.searchMedicineExpiry(searchRequest);
        return ResponseEntity.ok(results);
    }

    // Get dashboard data
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<ExpiryDashboardResponse> getDashboardData() {
        ExpiryDashboardResponse dashboardData = medicineExpiryService.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }

    // Update status
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<MedicineExpiryResponse> updateStatus(@PathVariable Long id, @RequestParam ExpiryStatus status) {
        try {
            MedicineExpiryResponse medicineExpiry = medicineExpiryService.updateStatus(id, status);
            return ResponseEntity.ok(medicineExpiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Bulk update status
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/bulk-status")
    public ResponseEntity<String> bulkUpdateStatus(@RequestParam List<Long> ids, @RequestParam ExpiryStatus status) {
        try {
            medicineExpiryService.bulkUpdateStatus(ids, status);
            return ResponseEntity.ok("Status updated successfully for " + ids.size() + " records");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Manual trigger for status update
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-statuses")
    public ResponseEntity<String> updateExpiryStatuses() {
        try {
            medicineExpiryService.updateExpiryStatuses();
            return ResponseEntity.ok("Expiry statuses updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get medicines by status
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MedicineExpiryResponse>> getMedicinesByStatus(@PathVariable ExpiryStatus status) {
        // This would need to be implemented in the service
        List<MedicineExpiryResponse> medicines = medicineExpiryService.getAllMedicineExpiry()
                .stream()
                .filter(m -> m.getStatus() == status)
                .toList();
        return ResponseEntity.ok(medicines);
    }

    // Get statistics for charts
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<Object> getStatistics() {
        // This could return various statistics for charts and graphs
        ExpiryDashboardResponse dashboardData = medicineExpiryService.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }
}