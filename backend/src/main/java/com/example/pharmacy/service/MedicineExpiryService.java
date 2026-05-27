package com.example.pharmacy.service;

import com.example.pharmacy.dto.*;
import com.example.pharmacy.entity.ExpiryStatus;
import com.example.pharmacy.entity.Medicine;
import com.example.pharmacy.entity.MedicineExpiry;
import com.example.pharmacy.repository.MedicineExpiryRepository;
import com.example.pharmacy.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicineExpiryService {

    @Autowired
    private MedicineExpiryRepository medicineExpiryRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    // Get all medicine expiry records
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> getAllMedicineExpiry() {
        List<MedicineExpiry> medicineExpiries = medicineExpiryRepository.findByStatusOrderByExpiryDateAsc(ExpiryStatus.ACTIVE);
        return convertToResponseList(medicineExpiries);
    }

    // Get medicine expiry by ID
    @Transactional(readOnly = true)
    public MedicineExpiryResponse getMedicineExpiryById(Long id) {
        MedicineExpiry medicineExpiry = medicineExpiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine expiry record not found with id: " + id));
        return convertToResponse(medicineExpiry);
    }

    // Create new medicine expiry record
    @Transactional
    public MedicineExpiryResponse createMedicineExpiry(MedicineExpiryRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));

        MedicineExpiry medicineExpiry = MedicineExpiry.builder()
                .medicine(medicine)
                .batchNumber(request.getBatchNumber())
                .expiryDate(request.getExpiryDate())
                .manufactureDate(request.getManufactureDate())
                .quantity(request.getQuantity())
                .purchasePrice(request.getPurchasePrice())
                .supplierName(request.getSupplierName())
                .status(request.getStatus() != null ? request.getStatus() : ExpiryStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        MedicineExpiry saved = medicineExpiryRepository.save(medicineExpiry);
        return convertToResponse(saved);
    }

    // Update medicine expiry record
    @Transactional
    public MedicineExpiryResponse updateMedicineExpiry(Long id, MedicineExpiryRequest request) {
        MedicineExpiry existing = medicineExpiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine expiry record not found with id: " + id));

        if (request.getMedicineId() != null) {
            Medicine medicine = medicineRepository.findById(request.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));
            existing.setMedicine(medicine);
        }

        if (request.getBatchNumber() != null) {
            existing.setBatchNumber(request.getBatchNumber());
        }
        if (request.getExpiryDate() != null) {
            existing.setExpiryDate(request.getExpiryDate());
        }
        if (request.getManufactureDate() != null) {
            existing.setManufactureDate(request.getManufactureDate());
        }
        if (request.getQuantity() != null) {
            existing.setQuantity(request.getQuantity());
        }
        if (request.getPurchasePrice() != null) {
            existing.setPurchasePrice(request.getPurchasePrice());
        }
        if (request.getSupplierName() != null) {
            existing.setSupplierName(request.getSupplierName());
        }
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            existing.setNotes(request.getNotes());
        }

        MedicineExpiry updated = medicineExpiryRepository.save(existing);
        return convertToResponse(updated);
    }

    // Delete medicine expiry record
    @Transactional
    public void deleteMedicineExpiry(Long id) {
        MedicineExpiry medicineExpiry = medicineExpiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine expiry record not found with id: " + id));
        medicineExpiryRepository.delete(medicineExpiry);
    }

    // Get expired medicines
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> getExpiredMedicines() {
        // Find all medicines that are actually expired, regardless of their stored status
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        List<MedicineExpiry> expiredMedicines = allMedicines.stream()
                .filter(me -> me.getExpiryDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());
        return convertToResponseList(expiredMedicines);
    }

    // Get medicines expiring soon (within 30 days)
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> getMedicinesExpiringSoon() {
        LocalDate futureDate = LocalDate.now().plusDays(30);
        List<MedicineExpiry> expiringSoon = medicineExpiryRepository.findMedicinesExpiringSoon(futureDate);
        return convertToResponseList(expiringSoon);
    }

    // Get medicines near expiry (within 7 days)
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> getMedicinesNearExpiry() {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(7);
        
        // Find all medicines that are near expiry, regardless of their stored status
        List<MedicineExpiry> allMedicines = medicineExpiryRepository.findAll();
        List<MedicineExpiry> nearExpiry = allMedicines.stream()
                .filter(me -> !me.getExpiryDate().isBefore(today) && me.getExpiryDate().isBefore(futureDate))
                .sorted((a, b) -> a.getExpiryDate().compareTo(b.getExpiryDate()))
                .collect(Collectors.toList());
        return convertToResponseList(nearExpiry);
    }

    // Get medicines by medicine ID
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> getMedicineExpiryByMedicineId(Long medicineId) {
        List<MedicineExpiry> medicineExpiries = medicineExpiryRepository.findByMedicineId(medicineId);
        return convertToResponseList(medicineExpiries);
    }

    // Search medicines by criteria
    @Transactional(readOnly = true)
    public List<MedicineExpiryResponse> searchMedicineExpiry(ExpirySearchRequest searchRequest) {
        List<MedicineExpiry> results;

        if (searchRequest.getMedicineName() != null && !searchRequest.getMedicineName().trim().isEmpty()) {
            results = medicineExpiryRepository.findByMedicineNameContaining(searchRequest.getMedicineName());
        } else if (searchRequest.getBatchNumber() != null && !searchRequest.getBatchNumber().trim().isEmpty()) {
            results = medicineExpiryRepository.findByBatchNumberContainingIgnoreCase(searchRequest.getBatchNumber());
        } else if (searchRequest.getSupplierName() != null && !searchRequest.getSupplierName().trim().isEmpty()) {
            results = medicineExpiryRepository.findBySupplierNameContainingIgnoreCase(searchRequest.getSupplierName());
        } else if (searchRequest.getExpiryDateFrom() != null && searchRequest.getExpiryDateTo() != null) {
            results = medicineExpiryRepository.findByExpiryDateBetween(searchRequest.getExpiryDateFrom(), searchRequest.getExpiryDateTo());
        } else {
            results = medicineExpiryRepository.findByStatusOrderByExpiryDateAsc(ExpiryStatus.ACTIVE);
        }

        // Apply additional filters
        if (searchRequest.getExpired() != null && searchRequest.getExpired()) {
            results = results.stream().filter(MedicineExpiry::isExpired).collect(Collectors.toList());
        }
        if (searchRequest.getExpiringSoon() != null && searchRequest.getExpiringSoon()) {
            results = results.stream().filter(MedicineExpiry::isExpiringSoon).collect(Collectors.toList());
        }
        if (searchRequest.getNearExpiry() != null && searchRequest.getNearExpiry()) {
            results = results.stream().filter(MedicineExpiry::isNearExpiry).collect(Collectors.toList());
        }

        return convertToResponseList(results);
    }

    // Get dashboard data
    @Transactional(readOnly = true)
    public ExpiryDashboardResponse getDashboardData() {
        long totalMedicines = medicineExpiryRepository.count();
        long activeMedicines = medicineExpiryRepository.countByStatus(ExpiryStatus.ACTIVE);
        long expiredMedicines = medicineExpiryRepository.countExpiredMedicines();
        long expiringSoonMedicines = medicineExpiryRepository.countMedicinesExpiringWithinDays(LocalDate.now().plusDays(30));
        long nearExpiryMedicines = medicineExpiryRepository.countMedicinesExpiringWithinDays(LocalDate.now().plusDays(7));
        long disposedMedicines = medicineExpiryRepository.countByStatus(ExpiryStatus.DISPOSED);

        // Calculate total value at risk (expiring medicines value)
        List<MedicineExpiry> expiring = medicineExpiryRepository.findMedicinesExpiringSoon(LocalDate.now().plusDays(30));
        double totalValueAtRisk = expiring.stream()
                .filter(me -> me.getPurchasePrice() != null)
                .mapToDouble(me -> me.getPurchasePrice().doubleValue() * me.getQuantity())
                .sum();

        // Count low stock medicines (threshold: 10)
        int lowStockCount = medicineExpiryRepository.findLowStockMedicines(10).size();

        return ExpiryDashboardResponse.builder()
                .totalMedicines(totalMedicines)
                .activeMedicines(activeMedicines)
                .expiredMedicines(expiredMedicines)
                .expiringSoonMedicines(expiringSoonMedicines)
                .nearExpiryMedicines(nearExpiryMedicines)
                .disposedMedicines(disposedMedicines)
                .totalValueAtRisk(totalValueAtRisk)
                .lowStockCount(lowStockCount)
                .build();
    }

    // Update status (for disposal, recall etc.)
    @Transactional
    public MedicineExpiryResponse updateStatus(Long id, ExpiryStatus status) {
        MedicineExpiry medicineExpiry = medicineExpiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine expiry record not found with id: " + id));
        
        medicineExpiry.setStatus(status);
        MedicineExpiry updated = medicineExpiryRepository.save(medicineExpiry);
        return convertToResponse(updated);
    }

    // Bulk update status
    @Transactional
    public void bulkUpdateStatus(List<Long> ids, ExpiryStatus status) {
        List<MedicineExpiry> medicineExpiries = medicineExpiryRepository.findAllById(ids);
        medicineExpiries.forEach(me -> me.setStatus(status));
        medicineExpiryRepository.saveAll(medicineExpiries);
    }

    // Automatic status update based on expiry date
    @Transactional
    public void updateExpiryStatuses() {
        List<MedicineExpiry> activeMedicines = medicineExpiryRepository.findByStatus(ExpiryStatus.ACTIVE);
        
        for (MedicineExpiry medicineExpiry : activeMedicines) {
            if (medicineExpiry.isExpired()) {
                medicineExpiry.setStatus(ExpiryStatus.EXPIRED);
            } else if (medicineExpiry.isExpiringSoon()) {
                medicineExpiry.setStatus(ExpiryStatus.EXPIRING_SOON);
            }
        }
        
        medicineExpiryRepository.saveAll(activeMedicines);
    }

    // Helper methods for conversion
    private MedicineExpiryResponse convertToResponse(MedicineExpiry medicineExpiry) {
        return MedicineExpiryResponse.builder()
                .id(medicineExpiry.getId())
                .medicineId(medicineExpiry.getMedicine().getId())
                .medicineName(medicineExpiry.getMedicine().getName())
                .batchNumber(medicineExpiry.getBatchNumber())
                .expiryDate(medicineExpiry.getExpiryDate())
                .manufactureDate(medicineExpiry.getManufactureDate())
                .quantity(medicineExpiry.getQuantity())
                .purchasePrice(medicineExpiry.getPurchasePrice())
                .supplierName(medicineExpiry.getSupplierName())
                .status(medicineExpiry.getStatus())
                .notes(medicineExpiry.getNotes())
                .createdAt(medicineExpiry.getCreatedAt())
                .updatedAt(medicineExpiry.getUpdatedAt())
                .daysUntilExpiry(medicineExpiry.getDaysUntilExpiry())
                .expired(medicineExpiry.isExpired())
                .expiringSoon(medicineExpiry.isExpiringSoon())
                .nearExpiry(medicineExpiry.isNearExpiry())
                .build();
    }

    private List<MedicineExpiryResponse> convertToResponseList(List<MedicineExpiry> medicineExpiries) {
        return medicineExpiries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}