package com.example.pharmacy.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpiryDashboardResponse {
    private long totalMedicines;
    private long activeMedicines;
    private long expiredMedicines;
    private long expiringSoonMedicines;
    private long nearExpiryMedicines;
    private long disposedMedicines;
    private double totalValueAtRisk;
    private int lowStockCount;
}