// src/main/java/com/example/pharmacy/service/SaleService.java
package com.example.pharmacy.service;

import com.example.pharmacy.entity.*;
import com.example.pharmacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DeliveryService deliveryService; // ADD THIS

    // Get all sales with eager loading
    @Transactional(readOnly = true)
    public List<Sale> getAllSales() {
        System.out.println("🔍 SaleService: Fetching all sales...");
        List<Sale> sales = saleRepository.findAll();

        // Force loading of lazy relationships
        for (Sale sale : sales) {
            if (sale.getItems() != null) {
                sale.getItems().size();
                sale.getItems().forEach(item -> {
                    if (item.getMedicine() != null) {
                        item.getMedicine().getName();
                    }
                });
            }
            if (sale.getUser() != null) {
                sale.getUser().getUsername();
            }
        }

        System.out.println("✅ SaleService: Loaded " + sales.size() + " sales with details");
        return sales;
    }

    // Get sale by ID with eager loading
    @Transactional(readOnly = true)
    public Sale getSaleById(Long id) {
        System.out.println("🔍 SaleService: Fetching sale with ID: " + id);
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + id));

        // Force loading of relationships
        if (sale.getItems() != null) {
            sale.getItems().size();
            sale.getItems().forEach(item -> {
                if (item.getMedicine() != null) {
                    item.getMedicine().getName();
                }
            });
        }
        if (sale.getUser() != null) {
            sale.getUser().getUsername();
        }

        return sale;
    }

    // Get sales by user ID
    @Transactional(readOnly = true)
    public List<Sale> getSalesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return saleRepository.findByUser(user);
    }

    // Create a new sale
    @Transactional
    public Sale createSale(Long userId, List<Long> medicineIds, List<Integer> quantities) {
        // Validate input
        if (medicineIds.size() != quantities.size()) {
            throw new RuntimeException("Medicine IDs and quantities must have the same length");
        }

        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Create sale
        Sale sale = Sale.builder()
                .user(user)
                .status(SaleStatus.PENDING)
                .saleDate(Instant.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        // Create sale items and calculate total
        for (int i = 0; i < medicineIds.size(); i++) {
            Long medicineId = medicineIds.get(i);
            Integer quantity = quantities.get(i);

            Medicine medicine = medicineRepository.findById(medicineId)
                    .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + medicineId));

            // Check stock availability
            if (medicine.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock for medicine: " + medicine.getName() +
                        ". Available: " + medicine.getQuantity() + ", Requested: " + quantity);
            }

            // Reduce stock
            medicine.setQuantity(medicine.getQuantity() - quantity);
            medicineRepository.save(medicine);

            // Create sale item
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(quantity)
                    .unitPrice(medicine.getPrice())
                    .build();

            sale.getItems().add(saleItem);

            // Add to total
            BigDecimal itemTotal = medicine.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(itemTotal);
        }

        // Set total amount
        sale.setTotalAmount(total);

        // Save sale (this will cascade to sale items)
        return saleRepository.save(sale);
    }

    // ✅ FIXED: Update sale status with AUTOMATIC DELIVERY CREATION
    @Transactional
    public Sale updateSaleStatus(Long saleId, SaleStatus newStatus) {
        Sale sale = getSaleById(saleId);
        SaleStatus oldStatus = sale.getStatus();
        sale.setStatus(newStatus);

        System.out.println("📊 Updating sale " + saleId + " from " + oldStatus + " to " + newStatus);

        // ✅ AUTOMATIC DELIVERY CREATION WHEN SALE IS COMPLETED
        if (oldStatus == SaleStatus.PENDING && newStatus == SaleStatus.COMPLETED) {
            System.out.println("🚚 Sale completed! Creating delivery record...");

            // Check if delivery already exists
            List<Delivery> existingDeliveries = deliveryRepository.findBySale(sale);

            if (existingDeliveries.isEmpty()) {
                // Create delivery with default address or customer address
                String deliveryAddress = "Customer Address - " + sale.getUser().getUsername();

                try {
                    Delivery delivery = deliveryService.createDeliveryForSale(sale, deliveryAddress);
                    System.out.println("✅ Delivery created automatically with ID: " + delivery.getId());
                } catch (Exception e) {
                    System.err.println("❌ Failed to create delivery: " + e.getMessage());
                    // Don't fail the sale update if delivery creation fails
                }
            } else {
                System.out.println("⚠️ Delivery already exists for this sale");
            }
        }

        return saleRepository.save(sale);
    }

    // Cancel sale (restore stock quantities)
    @Transactional
    public void cancelSale(Long saleId) {
        System.out.println("🗑️ Starting sale cancellation for ID: " + saleId);

        Sale sale = getSaleById(saleId);

        // Step 1: Restore stock quantities FIRST
        System.out.println("📦 Restoring stock quantities...");
        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                Medicine medicine = item.getMedicine();
                int newQuantity = medicine.getQuantity() + item.getQuantity();
                medicine.setQuantity(newQuantity);
                medicineRepository.save(medicine);
                System.out.println("✅ Restored " + item.getQuantity() + " units of " + medicine.getName());
            }
        }

        // Step 2: Delete related deliveries FIRST (to avoid foreign key constraint)
        System.out.println("🚚 Checking for related deliveries...");
        List<Delivery> deliveries = deliveryRepository.findBySale(sale);
        if (deliveries != null && !deliveries.isEmpty()) {
            System.out.println("🗑️ Deleting " + deliveries.size() + " related deliveries...");
            deliveryRepository.deleteAll(deliveries);
            System.out.println("✅ Deliveries deleted successfully");
        }

        // Step 3: Delete sale items (should cascade, but explicit for safety)
        System.out.println("🗑️ Deleting sale items...");
        if (sale.getItems() != null && !sale.getItems().isEmpty()) {
            saleItemRepository.deleteAll(sale.getItems());
            System.out.println("✅ Sale items deleted successfully");
        }

        // Step 4: Finally delete the sale
        System.out.println("🗑️ Deleting sale record...");
        saleRepository.delete(sale);
        System.out.println("✅ Sale deleted successfully - ID: " + saleId);
    }

    // Backward compatibility methods
    @Transactional(readOnly = true)
    public List<Sale> all() {
        return getAllSales();
    }

    @Transactional(readOnly = true)
    public Sale get(Long id) {
        return getSaleById(id);
    }

    @Transactional
    public Sale updateStatus(Long id, SaleStatus status) {
        return updateSaleStatus(id, status);
    }

    @Transactional
    public void delete(Long id) {
        cancelSale(id);
    }

    @Transactional(readOnly = true)
    public List<Sale> byUser(Long userId) {
        return getSalesByUserId(userId);
    }
}
