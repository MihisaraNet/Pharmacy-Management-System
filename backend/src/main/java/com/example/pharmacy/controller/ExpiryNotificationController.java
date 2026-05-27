package com.example.pharmacy.controller;

import com.example.pharmacy.dto.ExpiryNotificationResponse;
import com.example.pharmacy.service.ExpiryNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpiryNotificationController {

    @Autowired
    private ExpiryNotificationService notificationService;

    // Get all notifications using current strategy
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ExpiryNotificationResponse>> getAllNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Get notifications using all strategies
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all-strategies")
    public ResponseEntity<List<ExpiryNotificationResponse>> getAllNotificationsWithAllStrategies() {
        List<ExpiryNotificationResponse> notifications = notificationService.getAllNotificationsWithAllStrategies();
        return ResponseEntity.ok(notifications);
    }

    // Get critical notifications only
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/critical")
    public ResponseEntity<List<ExpiryNotificationResponse>> getCriticalNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getCriticalNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Get warning notifications only
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/warning")
    public ResponseEntity<List<ExpiryNotificationResponse>> getWarningNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getWarningNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Get advisory notifications only
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/advisory")
    public ResponseEntity<List<ExpiryNotificationResponse>> getAdvisoryNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getAdvisoryNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Get urgent notifications (critical + warning)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/urgent")
    public ResponseEntity<List<ExpiryNotificationResponse>> getUrgentNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getUrgentNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Set notification strategy
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/strategy/{strategyName}")
    public ResponseEntity<String> setNotificationStrategy(@PathVariable String strategyName) {
        try {
            notificationService.setNotificationStrategy(strategyName);
            return ResponseEntity.ok("Strategy set to: " + strategyName);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid strategy: " + e.getMessage());
        }
    }

    // Get current strategy information
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/strategy/current")
    public ResponseEntity<Map<String, String>> getCurrentStrategyInfo() {
        String info = notificationService.getCurrentStrategyInfo();
        return ResponseEntity.ok(Map.of("currentStrategy", info));
    }

    // Get strategy statistics
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/strategy/statistics")
    public ResponseEntity<Map<String, String>> getStrategyStatistics() {
        String stats = notificationService.getStrategyStatistics();
        return ResponseEntity.ok(Map.of("statistics", stats));
    }

    // Legacy endpoints for backward compatibility
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expired")
    public ResponseEntity<List<ExpiryNotificationResponse>> getExpiredNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getExpiredNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/near-expiry")
    public ResponseEntity<List<ExpiryNotificationResponse>> getNearExpiryNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getNearExpiryNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<ExpiryNotificationResponse>> getExpiringSoonNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getExpiringSoonNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/low-stock")
    public ResponseEntity<List<ExpiryNotificationResponse>> getLowStockNotifications() {
        List<ExpiryNotificationResponse> notifications = notificationService.getLowStockNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/urgent-count")
    public ResponseEntity<Integer> getUrgentNotificationCount() {
        int count = notificationService.getUrgentNotificationCount();
        return ResponseEntity.ok(count);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/total-count")
    public ResponseEntity<Integer> getTotalNotificationCount() {
        int count = notificationService.getTotalNotificationCount();
        return ResponseEntity.ok(count);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<Object> getNotificationSummary() {
        Object summary = notificationService.getNotificationSummary();
        return ResponseEntity.ok(summary);
    }
}