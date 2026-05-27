package com.example.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medicine_expiry")
public class MedicineExpiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "manufacture_date", nullable = false)
    private LocalDate manufactureDate;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "supplier_name")
    private String supplierName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ExpiryStatus status = ExpiryStatus.ACTIVE;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Calculate days until expiry
    public long getDaysUntilExpiry() {
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    // Check if medicine is expired
    public boolean isExpired() {
        return LocalDate.now().isAfter(expiryDate);
    }

    // Check if medicine is expiring soon (within 30 days)
    public boolean isExpiringSoon() {
        return getDaysUntilExpiry() <= 30 && getDaysUntilExpiry() > 0;
    }

    // Check if medicine is near expiry (within 7 days)
    public boolean isNearExpiry() {
        return getDaysUntilExpiry() <= 7 && getDaysUntilExpiry() > 0;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = ExpiryStatus.ACTIVE;
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}