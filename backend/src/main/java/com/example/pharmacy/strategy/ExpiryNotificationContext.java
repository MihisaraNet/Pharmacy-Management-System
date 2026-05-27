package com.example.pharmacy.strategy;

import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.dto.ExpiryNotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;

/**
 * Context Class for Strategy Pattern
 * Manages and executes different expiry notification strategies
 */
@Component
public class ExpiryNotificationContext {
    
    private final List<ExpiryNotificationStrategy> strategies;
    private ExpiryNotificationStrategy currentStrategy;
    
    @Autowired
    public ExpiryNotificationContext(List<ExpiryNotificationStrategy> strategies) {
        this.strategies = strategies;
        // Default to highest priority strategy
        this.currentStrategy = strategies.stream()
                .max(Comparator.comparing(ExpiryNotificationStrategy::getPriority))
                .orElse(null);
    }
    
    /**
     * Set the current strategy
     */
    public void setStrategy(ExpiryNotificationStrategy strategy) {
        this.currentStrategy = strategy;
        System.out.println("🔧 Strategy changed to: " + strategy.getStrategyName());
    }
    
    /**
     * Set strategy by name
     */
    public void setStrategyByName(String strategyName) {
        ExpiryNotificationStrategy strategy = strategies.stream()
                .filter(s -> s.getStrategyName().equals(strategyName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Strategy not found: " + strategyName));
        setStrategy(strategy);
    }
    
    /**
     * Execute current strategy
     */
    public List<ExpiryNotificationResponse> executeStrategy(List<MedicineExpiry> medicines) {
        if (currentStrategy == null) {
            throw new IllegalStateException("No strategy selected");
        }
        
        System.out.println("📋 Executing strategy: " + currentStrategy.getStrategyName() + 
                          " with " + medicines.size() + " medicines");
        
        List<ExpiryNotificationResponse> notifications = currentStrategy.processNotifications(medicines);
        
        System.out.println("✅ Strategy executed successfully. Generated " + 
                          notifications.size() + " notifications");
        
        return notifications;
    }
    
    /**
     * Execute all strategies and combine results (sorted by priority)
     */
    public List<ExpiryNotificationResponse> executeAllStrategies(List<MedicineExpiry> medicines) {
        List<ExpiryNotificationResponse> allNotifications = new ArrayList<>();
        
        System.out.println("🚀 Executing all strategies for " + medicines.size() + " medicines");
        
        // Sort strategies by priority (highest first)
        strategies.stream()
                .sorted(Comparator.comparing(ExpiryNotificationStrategy::getPriority).reversed())
                .forEach(strategy -> {
                    System.out.println("📋 Processing with: " + strategy.getStrategyName() + 
                                     " (Priority: " + strategy.getPriority() + ")");
                    
                    List<ExpiryNotificationResponse> strategyNotifications = strategy.processNotifications(medicines);
                    allNotifications.addAll(strategyNotifications);
                    
                    System.out.println("   ✓ Generated " + strategyNotifications.size() + " notifications");
                });
        
        System.out.println("🎯 Total notifications generated: " + allNotifications.size());
        return allNotifications;
    }
    
    /**
     * Get available strategies
     */
    public List<ExpiryNotificationStrategy> getAvailableStrategies() {
        return new ArrayList<>(strategies);
    }
    
    /**
     * Get current strategy info
     */
    public String getCurrentStrategyInfo() {
        if (currentStrategy == null) {
            return "No strategy selected";
        }
        return String.format("Current Strategy: %s (Priority: %d)", 
                           currentStrategy.getStrategyName(), 
                           currentStrategy.getPriority());
    }
    
    /**
     * Get strategy statistics
     */
    public String getStrategyStatistics() {
        StringBuilder stats = new StringBuilder();
        stats.append("📊 Strategy Statistics:\n");
        stats.append("Total Strategies: ").append(strategies.size()).append("\n");
        
        strategies.stream()
                .sorted(Comparator.comparing(ExpiryNotificationStrategy::getPriority).reversed())
                .forEach(strategy -> {
                    stats.append("  - ").append(strategy.getStrategyName())
                         .append(" (Priority: ").append(strategy.getPriority()).append(")\n");
                });
        
        stats.append("Current: ").append(getCurrentStrategyInfo());
        
        return stats.toString();
    }
}