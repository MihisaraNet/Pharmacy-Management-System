package com.example.pharmacy.strategy;

import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.dto.ExpiryNotificationResponse;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Warning Strategy - Medium priority notifications for medicines expiring soon
 */
@Component
public class WarningExpiryStrategy implements ExpiryNotificationStrategy {
    
    @Override
    public List<ExpiryNotificationResponse> processNotifications(List<MedicineExpiry> expiredMedicines) {
        LocalDate today = LocalDate.now();
        LocalDate warningThreshold = today.plusDays(7); // Within 7 days
        
        return expiredMedicines.stream()
                .filter(medicine -> medicine.getExpiryDate().isAfter(today))
                .filter(medicine -> medicine.getExpiryDate().isBefore(warningThreshold))
                .filter(medicine -> medicine.getQuantity() > 0)
                .map(this::createWarningNotification)
                .collect(Collectors.toList());
    }
    
    private ExpiryNotificationResponse createWarningNotification(MedicineExpiry medicine) {
        long daysUntilExpiry = LocalDate.now().until(medicine.getExpiryDate()).getDays();
        String message = String.format("⚠️ WARNING: %s (Batch: %s) expires in %d days (%s). Consider discount sale!", 
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
                .severity("WARNING")
                .actionRequired("DISCOUNT_SALE")
                .quantity(medicine.getQuantity())
                .estimatedLoss(medicine.getPurchasePrice().doubleValue() * medicine.getQuantity() * 0.3) // 30% potential loss
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    @Override
    public String getStrategyName() {
        return "WARNING_EXPIRY";
    }
    
    @Override
    public int getPriority() {
        return 50; // Medium priority
    }
}