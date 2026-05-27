package com.example.pharmacy.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpiryNotificationResponse {
    private Long id;
    private String message;
    private String type; // INFO, WARNING, DANGER (for backward compatibility)
    private String severity; // CRITICAL, WARNING, INFO (new field for Strategy Pattern)
    private String actionRequired; // DISPOSE_IMMEDIATELY, DISCOUNT_SALE, MONITOR
    private String medicineName;
    private String batchNumber;
    private Long medicineId;
    private Long expiryRecordId;
    private LocalDate expiryDate;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
    private Integer daysUntilExpiry;
    private Integer quantity;
    private Double estimatedLoss;
    private boolean urgent;
    private String strategyUsed; // Which strategy generated this notification
}