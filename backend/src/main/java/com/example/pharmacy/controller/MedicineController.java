// src/main/java/com/example/pharmacy/controller/MedicineController.java
package com.example.pharmacy.controller;

import com.example.pharmacy.entity.Medicine;
import com.example.pharmacy.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicineController {

    @Autowired
    private MedicineService service;

    // Get medicines (active only for customers, all for admin)
    @GetMapping
    public List<Medicine> list(@RequestParam(value = "availableOnly", defaultValue = "false") boolean availableOnly,
                               @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive) {
        if (includeInactive) {
            return service.getAllIncludingInactive(); // For admin
        } else if (availableOnly) {
            return service.availableForCustomers(); // For customers
        } else {
            return service.all(); // Active medicines only
        }
    }

    @GetMapping("/{id}")
    public Medicine get(@PathVariable Long id) {
        return service.get(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Medicine create(@RequestBody Medicine m) {
        return service.save(m);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Medicine update(@PathVariable Long id, @RequestBody Medicine m) {
        Medicine existing = service.get(id);
        existing.setName(m.getName());
        existing.setPrice(m.getPrice());
        existing.setQuantity(m.getQuantity());
        existing.setExpiryDate(m.getExpiryDate());
        existing.setCategory(m.getCategory());
        return service.save(existing);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            service.delete(id); // This now does soft delete
            return ResponseEntity.ok("Medicine marked as inactive successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Medicine> reactivate(@PathVariable Long id) {
        try {
            Medicine reactivated = service.reactivate(id);
            return ResponseEntity.ok(reactivated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/inactive")
    public List<Medicine> getInactiveMedicines() {
        return service.getAllIncludingInactive().stream()
                .filter(m -> !m.getActive())
                .toList();
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<String> hardDelete(@PathVariable Long id) {
        try {
            service.hardDelete(id);
            return ResponseEntity.ok("Medicine permanently deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
