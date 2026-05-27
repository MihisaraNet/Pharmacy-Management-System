package com.example.pharmacy.repository;

import com.example.pharmacy.entity.ExpiryStatus;
import com.example.pharmacy.entity.MedicineExpiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineExpiryRepository extends JpaRepository<MedicineExpiry, Long> {

    // Find by medicine ID
    List<MedicineExpiry> findByMedicineId(Long medicineId);

    // Find by status
    List<MedicineExpiry> findByStatus(ExpiryStatus status);

    // Find active medicine batches
    List<MedicineExpiry> findByStatusOrderByExpiryDateAsc(ExpiryStatus status);

    // Find expired medicines
    @Query("SELECT me FROM MedicineExpiry me WHERE me.expiryDate < :currentDate AND me.status = :status")
    List<MedicineExpiry> findExpiredMedicines(@Param("currentDate") LocalDate currentDate, @Param("status") ExpiryStatus status);

    // Find medicines expiring within specified days
    @Query("SELECT me FROM MedicineExpiry me WHERE me.expiryDate BETWEEN :currentDate AND :futureDate AND me.status = :status ORDER BY me.expiryDate ASC")
    List<MedicineExpiry> findMedicinesExpiringWithinDays(@Param("currentDate") LocalDate currentDate, @Param("futureDate") LocalDate futureDate, @Param("status") ExpiryStatus status);

    // Find medicines expiring soon (within 30 days)
    @Query("SELECT me FROM MedicineExpiry me WHERE me.expiryDate BETWEEN CURRENT_DATE AND :futureDate AND me.status = 'ACTIVE' ORDER BY me.expiryDate ASC")
    List<MedicineExpiry> findMedicinesExpiringSoon(@Param("futureDate") LocalDate futureDate);

    // Find medicines near expiry (within 7 days)
    @Query("SELECT me FROM MedicineExpiry me WHERE me.expiryDate BETWEEN CURRENT_DATE AND :futureDate AND me.status = 'ACTIVE' ORDER BY me.expiryDate ASC")
    List<MedicineExpiry> findMedicinesNearExpiry(@Param("futureDate") LocalDate futureDate);

    // Find by batch number
    List<MedicineExpiry> findByBatchNumberContainingIgnoreCase(String batchNumber);

    // Find by medicine ID and batch number (for auto-sync)
    List<MedicineExpiry> findByMedicineIdAndBatchNumber(Long medicineId, String batchNumber);

    // Find by supplier
    List<MedicineExpiry> findBySupplierNameContainingIgnoreCase(String supplierName);

    // Get total quantity by medicine ID and status
    @Query("SELECT SUM(me.quantity) FROM MedicineExpiry me WHERE me.medicine.id = :medicineId AND me.status = :status")
    Integer getTotalQuantityByMedicineAndStatus(@Param("medicineId") Long medicineId, @Param("status") ExpiryStatus status);

    // Get medicines grouped by expiry status
    @Query("SELECT me.status, COUNT(me), SUM(me.quantity) FROM MedicineExpiry me GROUP BY me.status")
    List<Object[]> getExpiryStatusSummary();

    // Find medicines by date range
    @Query("SELECT me FROM MedicineExpiry me WHERE me.expiryDate BETWEEN :startDate AND :endDate ORDER BY me.expiryDate ASC")
    List<MedicineExpiry> findByExpiryDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find medicines by medicine name (through join)
    @Query("SELECT me FROM MedicineExpiry me JOIN me.medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :medicineName, '%')) ORDER BY me.expiryDate ASC")
    List<MedicineExpiry> findByMedicineNameContaining(@Param("medicineName") String medicineName);

    // Get low stock medicines (quantity below threshold)
    @Query("SELECT me FROM MedicineExpiry me WHERE me.quantity <= :threshold AND me.status = 'ACTIVE' ORDER BY me.quantity ASC")
    List<MedicineExpiry> findLowStockMedicines(@Param("threshold") Integer threshold);

    // Count medicines by status
    Long countByStatus(ExpiryStatus status);

    // Count expired medicines
    @Query("SELECT COUNT(me) FROM MedicineExpiry me WHERE me.expiryDate < CURRENT_DATE AND me.status = 'ACTIVE'")
    Long countExpiredMedicines();

    // Count medicines expiring within days
    @Query("SELECT COUNT(me) FROM MedicineExpiry me WHERE me.expiryDate BETWEEN CURRENT_DATE AND :futureDate AND me.status = 'ACTIVE'")
    Long countMedicinesExpiringWithinDays(@Param("futureDate") LocalDate futureDate);
}