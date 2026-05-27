// src/main/java/com/example/pharmacy/service/MedicineService.java
package com.example.pharmacy.service;

import com.example.pharmacy.entity.Medicine;
import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.entity.ExpiryStatus;
import com.example.pharmacy.repository.MedicineRepository;
import com.example.pharmacy.repository.MedicineExpiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;
    
    @Autowired
    private MedicineExpiryRepository medicineExpiryRepository;

    // Get all active medicines
    @Transactional(readOnly = true)
    public List<Medicine> all() {
        return medicineRepository.findByActiveTrue();
    }

    // Get medicine by ID (active only)
    @Transactional(readOnly = true)
    public Medicine get(Long id) {
        return medicineRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    // Get all medicines (including inactive) - for admin
    @Transactional(readOnly = true)
    public List<Medicine> getAllIncludingInactive() {
        return medicineRepository.findAll();
    }

    // Save medicine
    @Transactional
    public Medicine save(Medicine medicine) {
        System.out.println("💾 Saving medicine: " + medicine.getName() + " with expiry: " + medicine.getExpiryDate());
        
        if (medicine.getCreatedAt() == null) {
            medicine.setCreatedAt(Instant.now());
        }
        if (medicine.getActive() == null) {
            medicine.setActive(true);
        }
        
        // Save the medicine first
        Medicine savedMedicine = medicineRepository.save(medicine);
        System.out.println("✅ Medicine saved with ID: " + savedMedicine.getId());
        
        // Auto-sync with medicine_expiry table
        syncWithExpiryTable(savedMedicine);
        
        return savedMedicine;
    }
    
    // Helper method to sync medicine with expiry tracking table
    private void syncWithExpiryTable(Medicine medicine) {
        try {
            System.out.println("🔄 Starting sync for medicine: " + medicine.getName() + " (ID: " + medicine.getId() + ")");
            
            // Check if there's already an expiry record for this medicine with "AUTO" batch
            String batchNumber = "AUTO-" + medicine.getId();
            System.out.println("🔍 Searching for existing records with batch: " + batchNumber);
            
            List<MedicineExpiry> existingRecords = medicineExpiryRepository
                .findByMedicineIdAndBatchNumber(medicine.getId(), batchNumber);
            
            System.out.println("📊 Found " + existingRecords.size() + " existing records");
            
            if (existingRecords.isEmpty()) {
                // Create new expiry record
                System.out.println("➕ Creating new expiry record");
                MedicineExpiry expiryRecord = MedicineExpiry.builder()
                    .medicine(medicine)
                    .batchNumber(batchNumber)
                    .expiryDate(medicine.getExpiryDate())
                    .manufactureDate(LocalDate.now().minusMonths(6)) // Default to 6 months ago
                    .quantity(medicine.getQuantity())
                    .purchasePrice(medicine.getPrice())
                    .supplierName("Auto-synced from medicine")
                    .status(determineExpiryStatus(medicine.getExpiryDate()))
                    .notes("Auto-generated from medicine table update")
                    .build();
                    
                MedicineExpiry saved = medicineExpiryRepository.save(expiryRecord);
                System.out.println("✅ Created expiry record for medicine: " + medicine.getName() + ", ID: " + saved.getId() + ", Status: " + saved.getStatus());
            } else {
                // Update existing record
                System.out.println("♾️ Updating existing record");
                MedicineExpiry existingRecord = existingRecords.get(0);
                existingRecord.setExpiryDate(medicine.getExpiryDate());
                existingRecord.setQuantity(medicine.getQuantity());
                existingRecord.setPurchasePrice(medicine.getPrice());
                existingRecord.setStatus(determineExpiryStatus(medicine.getExpiryDate()));
                existingRecord.setNotes("Auto-updated from medicine table on " + LocalDate.now());
                
                MedicineExpiry updated = medicineExpiryRepository.save(existingRecord);
                System.out.println("✅ Updated expiry record for medicine: " + medicine.getName() + ", Status: " + updated.getStatus());
            }
        } catch (Exception e) {
            System.out.println("⚠️ ERROR in sync: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the medicine save if expiry sync fails, but log the error
        }
    }
    
    // Helper method to determine expiry status based on date
    private ExpiryStatus determineExpiryStatus(LocalDate expiryDate) {
        LocalDate today = LocalDate.now();
        
        if (expiryDate.isBefore(today)) {
            return ExpiryStatus.EXPIRED;
        } else if (expiryDate.isBefore(today.plusDays(7))) {
            return ExpiryStatus.EXPIRING_SOON;
        } else {
            return ExpiryStatus.ACTIVE;
        }
    }

    // Soft delete - mark as inactive
    @Transactional
    public void delete(Long id) {
        System.out.println("🗑️ Soft deleting medicine with ID: " + id);

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        // Mark as inactive instead of deleting
        medicine.setActive(false);
        medicineRepository.save(medicine);

        System.out.println("✅ Medicine marked as inactive: " + medicine.getName());
    }

    // Reactivate medicine
    @Transactional
    public Medicine reactivate(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicine.setActive(true);
        return medicineRepository.save(medicine);
    }

    // Get available medicines for customers (active and quantity > 0)
    @Transactional(readOnly = true)
    public List<Medicine> availableForCustomers() {
        return medicineRepository.findByActiveTrueAndQuantityGreaterThan(0);
    }

    // Hard delete (for admin only - use with extreme caution)
    @Transactional
    public void hardDelete(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        
        // First delete all associated medicine expiry records to avoid foreign key constraint violation
        List<MedicineExpiry> medicineExpiries = medicineExpiryRepository.findByMedicineId(id);
        medicineExpiryRepository.deleteAll(medicineExpiries);
        
        // Then delete the medicine
        medicineRepository.delete(medicine);
    }
}
