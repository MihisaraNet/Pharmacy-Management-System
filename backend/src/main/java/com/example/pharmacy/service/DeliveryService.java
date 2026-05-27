// src/main/java/com/example/pharmacy/service/DeliveryService.java
package com.example.pharmacy.service;

import com.example.pharmacy.entity.*;
import com.example.pharmacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private SaleRepository saleRepository;

    // ✅ CREATE METHOD - matches controller call: service.create(saleId, address)
    @Transactional
    public Delivery create(Long saleId, String address) {
        System.out.println("🚚 Creating delivery for sale ID: " + saleId);

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));

        Delivery delivery = Delivery.builder()
                .sale(sale)
                .address(address != null ? address : "Default delivery address")
                .status(DeliveryStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);
        System.out.println("✅ Delivery created with ID: " + savedDelivery.getId());
        return savedDelivery;
    }

    // ✅ UPDATE METHOD - matches controller call: service.update(id, status, address)
    @Transactional
    public Delivery update(Long id, DeliveryStatus status, String address) {
        System.out.println("🔄 Updating delivery ID: " + id);

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + id));

        // Update status if provided
        if (status != null) {
            delivery.setStatus(status);
            System.out.println("📊 Updated delivery status to: " + status);

            // Set delivery date when status becomes DELIVERED
            if (status == DeliveryStatus.DELIVERED && delivery.getDeliveryDate() == null) {
                delivery.setDeliveryDate(Instant.now());
                System.out.println("📅 Set delivery date to now");
            }
        }

        // Update address if provided
        if (address != null && !address.trim().isEmpty()) {
            delivery.setAddress(address);
            System.out.println("📍 Updated delivery address to: " + address);
        }

        Delivery savedDelivery = deliveryRepository.save(delivery);
        System.out.println("✅ Delivery updated successfully");
        return savedDelivery;
    }

    // ✅ ALL METHOD - matches controller call: service.all()
    @Transactional(readOnly = true)
    public List<Delivery> all() {
        System.out.println("📋 Fetching all deliveries...");
        List<Delivery> deliveries = deliveryRepository.findAll();

        // Force loading of lazy relationships
        for (Delivery delivery : deliveries) {
            if (delivery.getSale() != null) {
                delivery.getSale().getId(); // Force sale loading
                if (delivery.getSale().getUser() != null) {
                    delivery.getSale().getUser().getUsername(); // Force user loading
                }
            }
        }

        System.out.println("✅ Loaded " + deliveries.size() + " deliveries");
        return deliveries;
    }

    // ✅ GET METHOD - matches controller call: service.get(id)
    @Transactional(readOnly = true)
    public Delivery get(Long id) {
        System.out.println("🔍 Fetching delivery with ID: " + id);

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + id));

        // Force loading of relationships
        if (delivery.getSale() != null) {
            delivery.getSale().getId();
            if (delivery.getSale().getUser() != null) {
                delivery.getSale().getUser().getUsername();
            }
        }

        return delivery;
    }

    // ✅ DELETE METHOD - matches controller call: service.delete(id)
    @Transactional
    public void delete(Long id) {
        System.out.println("🗑️ Deleting delivery with ID: " + id);

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + id));

        deliveryRepository.delete(delivery);
        System.out.println("✅ Delivery deleted successfully");
    }

    // ✅ ADDITIONAL HELPER METHODS

    // Create delivery for completed sale (used by SaleService)
    @Transactional
    public Delivery createDeliveryForSale(Sale sale, String address) {
        System.out.println("🚚 Creating delivery for sale ID: " + sale.getId());

        Delivery delivery = Delivery.builder()
                .sale(sale)
                .address(address != null ? address : "Default delivery address")
                .status(DeliveryStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);
        System.out.println("✅ Delivery created with ID: " + savedDelivery.getId());
        return savedDelivery;
    }

    // Get deliveries by sale
    @Transactional(readOnly = true)
    public List<Delivery> getDeliveriesBySale(Sale sale) {
        return deliveryRepository.findBySale(sale);
    }

    // Get deliveries by status
    @Transactional(readOnly = true)
    public List<Delivery> getDeliveriesByStatus(DeliveryStatus status) {
        return deliveryRepository.findByStatus(status);
    }
}
