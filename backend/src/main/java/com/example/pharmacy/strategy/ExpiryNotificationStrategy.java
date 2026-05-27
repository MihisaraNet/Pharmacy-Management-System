package com.example.pharmacy.strategy;

import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.dto.ExpiryNotificationResponse;
import java.util.List;

/**
 * Strategy Interface for different expiry notification strategies
 */
public interface ExpiryNotificationStrategy {
    
    /**
     * Process notifications based on the specific strategy
     * @param expiredMedicines List of expired medicines
     * @return List of notification responses
     */
    List<ExpiryNotificationResponse> processNotifications(List<MedicineExpiry> expiredMedicines);
    
    /**
     * Get the strategy name
     * @return Strategy identifier
     */
    String getStrategyName();
    
    /**
     * Get priority level of this strategy
     * @return Priority level (higher number = higher priority)
     */
    int getPriority();
}