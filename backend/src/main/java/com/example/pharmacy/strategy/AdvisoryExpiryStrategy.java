package com.example.pharmacy.strategy;

import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.dto.ExpiryNotificationResponse;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Advisory Strategy - Low priority notifications for informational purposes
 */
@Component
public class AdvisoryExpiryStrategy implements ExpiryNotificationStrategy {
    
    @Override
    public List<ExpiryNotificationResponse> processNotifications(List<MedicineExpiry> expiredMedicines) {
        LocalDate today = LocalDate.now();
        LocalDate advisoryThreshold = today.plusDays(30); // Within 30 days
        
        return expiredMedicines.stream()
                .filter(medicine -> medicine.getExpiryDate().isAfter(today.plusDays(7))) // After warning period
                .filter(medicine -> medicine.getExpiryDate().isBefore(advisoryThreshold))
                .filter(medicine -> medicine.getQuantity() > 0)
                .map(this::createAdvisoryNotification)
                .collect(Collectors.toList());
    }
    
    private ExpiryNotificationResponse createAdvisoryNotification(MedicineExpiry medicine) {
        long daysUntilExpiry = LocalDate.now().until(medicine.getExpiryDate()).getDays();
        String message = String.format("ℹ️ ADVISORY: %s (Batch: %s) will expire in %d days (%s). Monitor stock levels.", 
                medicine.getMedicine().getName(), 
                medicine.getBatchNumber(), 
                daysUntilExpiry,
                medicine.getExpiryDate());
        
        return ExpiryNotificationResponse.builder()
                .id(medicine.getId())
                .medicineId(medicine.getMedicine().getId())
                .medicineName(medicine.getMedicine().getName())
                .batchNumber(medicine.getBatchNumber())
                .expiryDate(medicine.getExpiryDate())
                .message(message)
                .severity("INFO")
                .actionRequired("MONITOR")
                .quantity(medicine.getQuantity())
                .estimatedLoss(0.0) // No immediate loss expected
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    @Override
    public String getStrategyName() {
        return "ADVISORY_EXPIRY";
    }
    
    @Override
    public int getPriority() {
        return 10; // Lowest priority
    }
}