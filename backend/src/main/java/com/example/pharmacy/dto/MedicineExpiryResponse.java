package com.example.pharmacy.dto;

import com.example.pharmacy.entity.ExpiryStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineExpiryResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private Integer quantity;
    private BigDecimal purchasePrice;
    private String supplierName;
    private ExpiryStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private long daysUntilExpiry;
    private boolean expired;
    private boolean expiringSoon;
    private boolean nearExpiry;
}