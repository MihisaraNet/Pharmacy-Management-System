package com.example.pharmacy.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpirySearchRequest {
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private String supplierName;
    private LocalDate expiryDateFrom;
    private LocalDate expiryDateTo;
    private LocalDate manufactureDateFrom;
    private LocalDate manufactureDateTo;
    private String status;
    private Boolean expired;
    private Boolean expiringSoon;
    private Boolean nearExpiry;
    private Integer daysUntilExpiry;
}