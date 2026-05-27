package com.example.pharmacy.strategy;

import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.dto.ExpiryNotificationResponse;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Critical Strategy - High priority notifications for expired medicines
 */
@Component
public class CriticalExpiryStrategy implements ExpiryNotificationStrategy {
    
    @Override
    public List<ExpiryNotificationResponse> processNotifications(List<MedicineExpiry> expiredMedicines) {
        return expiredMedicines.stream()
                .filter(medicine -> medicine.getExpiryDate().isBefore(LocalDate.now()))
                .filter(medicine -> medicine.getQuantity() > 0) // Only medicines with stock
                .map(this::createCriticalNotification)
                .collect(Collectors.toList());
    }
    
    private ExpiryNotificationResponse createCriticalNotification(MedicineExpiry medicine) {
        String message = String.format("🚨 CRITICAL: %s (Batch: %s) expired on %s. Immediate disposal required!", 
                medicine.getMedicine().getName(), 
                medicine.getBatchNumber(), 
                medicine.getExpiryDate());
        
        return ExpiryNotificationResponse.builder()
                .id(medicine.getId())
                .medicineId(medicine.getMedicine().getId())
                .medicineName(medicine.getMedicine().getName())
                .batchNumber(medicine.getBatchNumber())
                .expiryDate(medicine.getExpiryDate())
                .message(message)
                .severity("CRITICAL")
                .actionRequired("DISPOSE_IMMEDIATELY")
                .quantity(medicine.getQuantity())
                .estimatedLoss(medicine.getPurchasePrice().doubleValue() * medicine.getQuantity())
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    @Override
    public String getStrategyName() {
        return "CRITICAL_EXPIRY";
    }
    
    @Override
    public int getPriority() {
        return 100; // Highest priority
    }
}