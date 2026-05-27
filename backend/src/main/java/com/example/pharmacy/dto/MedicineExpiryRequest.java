package com.example.pharmacy.dto;

import com.example.pharmacy.entity.ExpiryStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineExpiryRequest {
    private Long medicineId;
    private String batchNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private Integer quantity;
    private BigDecimal purchasePrice;
    private String supplierName;
    private ExpiryStatus status;
    private String notes;
}