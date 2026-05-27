package com.example.pharmacy.strategy.report;

import com.example.pharmacy.entity.Medicine;
import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import com.example.pharmacy.repository.MedicineRepository;
import com.example.pharmacy.repository.ReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Low Stock Report Generator Strategy
 * Generates inventory and stock level analysis reports
 */
@Component
public class LowStockReportGenerator implements ReportGenerator {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Report generateReport(Map<String, Object> parameters) {
        try {
            validateParameters(parameters);

            Integer threshold = (Integer) parameters.getOrDefault("threshold", 10);

            Map<String, Object> reportData = generateLowStockData(threshold);

            Report report = Report.builder()
                    .reportType(ReportType.LOW_STOCK)
                    .content(objectMapper.writeValueAsString(reportData))
                    .generatedDate(Instant.now())
                    .build();

            return reportRepository.save(report);

        } catch (Exception e) {
            throw new RuntimeException("Error generating low stock report: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> generateLowStockData(Integer threshold) {
        Map<String, Object> data = new HashMap<>();

        List<Medicine> allMedicines = medicineRepository.findAll();

        // Filter low stock medicines
        List<Medicine> lowStockMedicines = allMedicines.stream()
                .filter(m -> m.getQuantity() <= threshold)
                .sorted(Comparator.comparing(Medicine::getQuantity))
                .collect(Collectors.toList());

        // Out of stock medicines
        List<Medicine> outOfStockMedicines = allMedicines.stream()
                .filter(m -> m.getQuantity() == 0)
                .collect(Collectors.toList());

        // Expired medicines
        LocalDate today = LocalDate.now();
        List<Medicine> expiredMedicines = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        // Expiring soon (within 30 days)
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<Medicine> expiringSoonMedicines = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null &&
                        m.getExpiryDate().isAfter(today) &&
                        m.getExpiryDate().isBefore(thirtyDaysFromNow))
                .collect(Collectors.toList());

        // Summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("reportType", "LOW_STOCK");
        summary.put("generatedBy", "LowStockReportGenerator");
        summary.put("totalMedicines", allMedicines.size());
        summary.put("lowStockCount", lowStockMedicines.size());
        summary.put("outOfStockCount", outOfStockMedicines.size());
        summary.put("expiredCount", expiredMedicines.size());
        summary.put("expiringSoonCount", expiringSoonMedicines.size());
        summary.put("threshold", threshold);
        summary.put("generatedAt", Instant.now().toString());

        // Low stock items detail
        List<Map<String, Object>> lowStockDetails = lowStockMedicines.stream()
                .map(medicine -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", medicine.getId());
                    item.put("name", medicine.getName());
                    item.put("category", medicine.getCategory());
                    item.put("currentStock", medicine.getQuantity());
                    item.put("price", medicine.getPrice().doubleValue());
                    item.put("expiryDate", medicine.getExpiryDate() != null ? medicine.getExpiryDate().toString() : null);

                    // Calculate status
                    String status = "LOW_STOCK";
                    if (medicine.getQuantity() == 0) {
                        status = "OUT_OF_STOCK";
                    }
                    if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(today)) {
                        status = "EXPIRED";
                    }
                    item.put("status", status);

                    // Calculate days until expiry
                    if (medicine.getExpiryDate() != null) {
                        long daysUntilExpiry = ChronoUnit.DAYS.between(today, medicine.getExpiryDate());
                        item.put("daysUntilExpiry", daysUntilExpiry);
                    }

                    return item;
                })
                .collect(Collectors.toList());

        // Category-wise analysis
        Map<String, Long> categoryBreakdown = lowStockMedicines.stream()
                .collect(Collectors.groupingBy(
                        medicine -> medicine.getCategory() != null ? medicine.getCategory() : "Uncategorized",
                        Collectors.counting()
                ));

        // Critical alerts
        List<Map<String, Object>> criticalAlerts = new ArrayList<>();

        // Add out of stock alerts
        outOfStockMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "OUT_OF_STOCK");
            alert.put("severity", "HIGH");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("message", "Medicine is completely out of stock");
            criticalAlerts.add(alert);
        });

        // Add expired alerts
        expiredMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "EXPIRED");
            alert.put("severity", "HIGH");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("expiryDate", medicine.getExpiryDate().toString());
            alert.put("message", "Medicine has expired and should be removed");
            criticalAlerts.add(alert);
        });

        // Add expiring soon alerts
        expiringSoonMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "EXPIRING_SOON");
            alert.put("severity", "MEDIUM");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("expiryDate", medicine.getExpiryDate().toString());
            alert.put("daysUntilExpiry", ChronoUnit.DAYS.between(today, medicine.getExpiryDate()));
            alert.put("message", "Medicine will expire within 30 days");
            criticalAlerts.add(alert);
        });

        // Build final data structure
        data.put("summary", summary);
        data.put("lowStockItems", lowStockDetails);
        data.put("categoryBreakdown", categoryBreakdown);
        data.put("criticalAlerts", criticalAlerts);

        // Recommendations
        List<String> recommendations = generateStockRecommendations(lowStockMedicines, outOfStockMedicines, expiredMedicines);
        data.put("recommendations", recommendations);

        return data;
    }

    private List<String> generateStockRecommendations(List<Medicine> lowStock, List<Medicine> outOfStock, List<Medicine> expired) {
        List<String> recommendations = new ArrayList<>();

        if (!outOfStock.isEmpty()) {
            recommendations.add("URGENT: Restock " + outOfStock.size() + " out-of-stock medicines immediately");
        }

        if (!expired.isEmpty()) {
            recommendations.add("Remove " + expired.size() + " expired medicines from inventory");
        }

        if (!lowStock.isEmpty()) {
            recommendations.add("Order " + lowStock.size() + " medicines with low stock levels");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Stock levels are healthy - no immediate action required");
        }

        return recommendations;
    }

    @Override
    public ReportType getReportType() {
        return ReportType.LOW_STOCK;
    }

    @Override
    public String getGeneratorName() {
        return "LOW_STOCK_GENERATOR";
    }

    @Override
    public int getPriority() {
        return 90;
    }

    @Override
    public String getDescription() {
        return "Inventory analysis with low stock alerts, expiry warnings, and restocking recommendations";
    }

    @Override
    public boolean validateParameters(Map<String, Object> parameters) {
        if (parameters == null) {
            throw new IllegalArgumentException("Parameters cannot be null");
        }

        if (parameters.containsKey("threshold")) {
            Object threshold = parameters.get("threshold");
            if (!(threshold instanceof Integer)) {
                throw new IllegalArgumentException("Threshold must be an Integer");
            }
            if ((Integer) threshold < 0) {
                throw new IllegalArgumentException("Threshold must be non-negative");
            }
        }

        return true;
    }

    @Override
    public String[] getRequiredParameters() {
        return new String[]{};
    }

    @Override
    public String[] getOptionalParameters() {
        return new String[]{"threshold"};
    }
}
