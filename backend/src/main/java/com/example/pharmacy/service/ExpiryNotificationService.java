package com.example.pharmacy.service;

import com.example.pharmacy.dto.ExpiryNotificationResponse;
import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.repository.MedicineExpiryRepository;
import com.example.pharmacy.strategy.ExpiryNotificationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpiryNotificationService {

    @Autowired
    private MedicineExpiryRepository medicineExpiryRepository;
    
    @Autowired
    private ExpiryNotificationContext notificationContext;

    /**
     * Get all notifications using the current strategy
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getAllNotifications() {
        System.out.println("🔔 Getting all notifications using Strategy Pattern");
        
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        System.out.println("📋 Found " + allMedicines.size() + " medicines in database");
        
        return notificationContext.executeStrategy(allMedicines);
    }
    
    /**
     * Get notifications using all strategies
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getAllNotificationsWithAllStrategies() {
        System.out.println("🔔 Getting notifications using ALL strategies");
        
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        List<ExpiryNotificationResponse> notifications = notificationContext.executeAllStrategies(allMedicines);
        
        // Add strategy information to each notification
        return notifications.stream()
                .peek(notification -> {
                    if (notification.getStrategyUsed() == null) {
                        // Determine strategy based on severity
                        switch (notification.getSeverity()) {
                            case "CRITICAL" -> notification.setStrategyUsed("CRITICAL_EXPIRY");
                            case "WARNING" -> notification.setStrategyUsed("WARNING_EXPIRY");
                            case "INFO" -> notification.setStrategyUsed("ADVISORY_EXPIRY");
                            default -> notification.setStrategyUsed("UNKNOWN");
                        }
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Get critical notifications only
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getCriticalNotifications() {
        System.out.println("🚨 Getting CRITICAL notifications only");
        
        notificationContext.setStrategyByName("CRITICAL_EXPIRY");
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        
        return notificationContext.executeStrategy(allMedicines);
    }

    /**
     * Get warning notifications only
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getWarningNotifications() {
        System.out.println("⚠️ Getting WARNING notifications only");
        
        notificationContext.setStrategyByName("WARNING_EXPIRY");
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        
        return notificationContext.executeStrategy(allMedicines);
    }

    /**
     * Get advisory notifications only
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getAdvisoryNotifications() {
        System.out.println("ℹ️ Getting ADVISORY notifications only");
        
        notificationContext.setStrategyByName("ADVISORY_EXPIRY");
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        
        return notificationContext.executeStrategy(allMedicines);
    }

    /**
     * Set notification strategy
     */
    public void setNotificationStrategy(String strategyName) {
        System.out.println("🔧 Setting notification strategy to: " + strategyName);
        notificationContext.setStrategyByName(strategyName);
    }

    /**
     * Get current strategy information
     */
    public String getCurrentStrategyInfo() {
        return notificationContext.getCurrentStrategyInfo();
    }

    /**
     * Get strategy statistics
     */
    public String getStrategyStatistics() {
        return notificationContext.getStrategyStatistics();
    }

    /**
     * Get urgent notifications (critical + warning)
     */
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getUrgentNotifications() {
        System.out.println("🚨 Getting urgent notifications (critical + warning)");
        
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        List<ExpiryNotificationResponse> allNotifications = notificationContext.executeAllStrategies(allMedicines);
        
        return allNotifications.stream()
                .filter(notification -> 
                    "CRITICAL".equals(notification.getSeverity()) || 
                    "WARNING".equals(notification.getSeverity()))
                .collect(Collectors.toList());
    }

    // Legacy methods for backward compatibility
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getExpiryNotifications() {
        return getAllNotifications();
    }
    
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getExpiredNotifications() {
        return getCriticalNotifications();
    }
    
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getNearExpiryNotifications() {
        return getWarningNotifications();
    }
    
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getExpiringSoonNotifications() {
        return getAdvisoryNotifications();
    }
    
    @Transactional(readOnly = true)
    public List<ExpiryNotificationResponse> getLowStockNotifications() {
        // For now, return empty list - this could be implemented as another strategy
        return List.of();
    }

    // Count methods using Strategy Pattern
    public int getUrgentNotificationCount() {
        return getUrgentNotifications().size();
    }

    public int getTotalNotificationCount() {
        return getAllNotificationsWithAllStrategies().size();
    }

    public Object getNotificationSummary() {
        List<ExpiryNotificationResponse> critical = getCriticalNotifications();
        List<ExpiryNotificationResponse> warning = getWarningNotifications();
        List<ExpiryNotificationResponse> advisory = getAdvisoryNotifications();
        
        return new Object() {
            public final int totalNotifications = critical.size() + warning.size() + advisory.size();
            public final int urgentNotifications = critical.size() + warning.size();
            public final int criticalCount = critical.size();
            public final int warningCount = warning.size();
            public final int advisoryCount = advisory.size();
            public final String currentStrategy = getCurrentStrategyInfo();
            public final String strategyStats = getStrategyStatistics();
        };
    }
}