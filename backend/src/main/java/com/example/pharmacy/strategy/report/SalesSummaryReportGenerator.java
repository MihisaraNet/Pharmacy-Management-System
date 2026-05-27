package com.example.pharmacy.strategy.report;

import com.example.pharmacy.entity.*;
import com.example.pharmacy.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Sales Summary Report Generator Strategy
 * Generates comprehensive sales analysis reports
 */
@Component
public class SalesSummaryReportGenerator implements ReportGenerator {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Report generateReport(Map<String, Object> parameters) {
        try {
            validateParameters(parameters);

            // Calculate one-month period (last 30 days)
            Instant end = Instant.now();
            Instant start = end.minusSeconds(30 * 24 * 60 * 60); // 30 days ago

            // If custom dates are provided, use them
            if (parameters != null) {
                if (parameters.containsKey("start") && parameters.get("start") instanceof Instant) {
                    start = (Instant) parameters.get("start");
                }
                if (parameters.containsKey("end") && parameters.get("end") instanceof Instant) {
                    end = (Instant) parameters.get("end");
                }
            }

            Map<String, Object> reportData = generateSalesData(start, end);

            Report report = Report.builder()
                    .reportType(ReportType.SALES_SUMMARY)
                    .content(objectMapper.writeValueAsString(reportData))
                    .generatedDate(Instant.now())
                    .build();

            return reportRepository.save(report);

        } catch (Exception e) {
            throw new RuntimeException("Error generating sales summary report: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> generateSalesData(Instant start, Instant end) {
        Map<String, Object> data = new HashMap<>();

        // Period information
        Map<String, Object> period = new HashMap<>();
        period.put("start", start.toString());
        period.put("end", end.toString());
        period.put("days", ChronoUnit.DAYS.between(start, end) + 1);
        data.put("period", period);

        // Get sales in date range
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);

        // Sales metrics
        Map<String, Object> salesMetrics = calculateSalesMetrics(sales, start, end);
        data.put("salesAnalytics", salesMetrics);

        // Top selling medicines
        List<Map<String, Object>> topMedicines = calculateTopSellingMedicines(start, end);
        salesMetrics.put("topSellingMedicines", topMedicines);

        // Customer analytics
        Map<String, Object> customerAnalytics = calculateCustomerAnalytics(sales);
        data.put("customerAnalytics", customerAnalytics);

        // Delivery analytics
        Map<String, Object> deliveryAnalytics = calculateDeliveryAnalytics(start, end);
        data.put("deliveryAnalytics", deliveryAnalytics);

        // Summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("reportType", "SALES_SUMMARY");
        summary.put("generatedBy", "SalesSummaryReportGenerator");
        summary.put("totalSales", sales.size());
        summary.put("totalRevenue", salesMetrics.get("totalRevenue"));
        summary.put("averageOrderValue", salesMetrics.get("averageOrderValue"));
        summary.put("generatedAt", Instant.now().toString());
        data.put("summary", summary);

        return data;
    }

    private Map<String, Object> calculateSalesMetrics(List<Sale> sales, Instant start, Instant end) {
        Map<String, Object> metrics = new HashMap<>();

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalSales = sales.size();
        BigDecimal avgOrderValue = totalSales > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(totalSales), 2, BigDecimal.ROUND_HALF_UP) :
                BigDecimal.ZERO;

        long totalItems = sales.stream()
                .flatMap(sale -> sale.getItems().stream())
                .mapToLong(item -> item.getQuantity())
                .sum();

        Set<Long> uniqueCustomers = sales.stream()
                .map(sale -> sale.getUser().getId())
                .collect(Collectors.toSet());

        // Status breakdown
        Map<String, Map<String, Object>> statusBreakdown = new HashMap<>();
        for (SaleStatus status : SaleStatus.values()) {
            long count = sales.stream().filter(s -> s.getStatus() == status).count();
            double percentage = totalSales > 0 ? (double) count / totalSales * 100 : 0;

            Map<String, Object> statusData = new HashMap<>();
            statusData.put("count", count);
            statusData.put("percentage", percentage);
            statusBreakdown.put(status.name(), statusData);
        }

        // Daily averages
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        double dailyAvgRevenue = days > 0 ? totalRevenue.doubleValue() / days : 0;
        double dailyAvgOrders = days > 0 ? (double) totalSales / days : 0;

        metrics.put("totalRevenue", totalRevenue.doubleValue());
        metrics.put("totalSalesCount", totalSales);
        metrics.put("averageOrderValue", avgOrderValue.doubleValue());
        metrics.put("totalItemsSold", totalItems);
        metrics.put("uniqueCustomers", uniqueCustomers.size());
        metrics.put("statusBreakdown", statusBreakdown);
        metrics.put("dailyAverageRevenue", dailyAvgRevenue);
        metrics.put("dailyAverageOrders", dailyAvgOrders);
        metrics.put("averageItemsPerOrder", totalSales > 0 ? (double) totalItems / totalSales : 0);

        return metrics;
    }

    private List<Map<String, Object>> calculateTopSellingMedicines(Instant start, Instant end) {
        List<Object[]> topMedicinesData = saleItemRepository.getTopSellingMedicines(start, end);

        List<Map<String, Object>> topMedicines = new ArrayList<>();
        int rank = 1;

        for (Object[] row : topMedicinesData) {
            Medicine medicine = (Medicine) row[0];
            Long quantitySold = (Long) row[1];
            BigDecimal revenue = (BigDecimal) row[2];

            Map<String, Object> medicineData = new HashMap<>();
            medicineData.put("rank", rank++);
            medicineData.put("id", medicine.getId());
            medicineData.put("name", medicine.getName());
            medicineData.put("category", medicine.getCategory());
            medicineData.put("quantitySold", quantitySold);
            medicineData.put("revenue", revenue.doubleValue());
            medicineData.put("currentStock", medicine.getQuantity());

            topMedicines.add(medicineData);
        }

        return topMedicines;
    }

    private Map<String, Object> calculateCustomerAnalytics(List<Sale> sales) {
        Map<String, Object> analytics = new HashMap<>();

        Map<User, List<Sale>> customerSales = sales.stream()
                .collect(Collectors.groupingBy(Sale::getUser));

        List<Map<String, Object>> topCustomers = customerSales.entrySet().stream()
                .map(entry -> {
                    User customer = entry.getKey();
                    List<Sale> customerPurchases = entry.getValue();

                    BigDecimal totalSpent = customerPurchases.stream()
                            .map(Sale::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Map<String, Object> customerData = new HashMap<>();
                    customerData.put("id", customer.getId());
                    customerData.put("username", customer.getUsername());
                    customerData.put("email", customer.getEmail());
                    customerData.put("totalOrders", customerPurchases.size());
                    customerData.put("totalSpent", totalSpent.doubleValue());
                    customerData.put("averageOrderValue",
                            totalSpent.divide(BigDecimal.valueOf(customerPurchases.size()), 2, BigDecimal.ROUND_HALF_UP).doubleValue());

                    return customerData;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("totalSpent"), (Double) a.get("totalSpent")))
                .limit(10)
                .collect(Collectors.toList());

        analytics.put("topCustomers", topCustomers);
        analytics.put("uniqueCustomers", customerSales.size());
        analytics.put("averageOrdersPerCustomer",
                customerSales.size() > 0 ? (double) sales.size() / customerSales.size() : 0);

        return analytics;
    }

    private Map<String, Object> calculateDeliveryAnalytics(Instant start, Instant end) {
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);
        List<Delivery> deliveries = sales.stream()
                .map(Sale::getDelivery)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();

        long totalDeliveries = deliveries.size();
        long completedDeliveries = deliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .count();

        double completionRate = totalDeliveries > 0 ?
                (double) completedDeliveries / totalDeliveries * 100 : 0;

        double averageDeliveryTimeHours = deliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED && d.getDeliveryDate() != null)
                .mapToLong(d -> ChronoUnit.HOURS.between(d.getCreatedAt(), d.getDeliveryDate()))
                .average()
                .orElse(0);

        analytics.put("totalDeliveries", totalDeliveries);
        analytics.put("completedDeliveries", completedDeliveries);
        analytics.put("completionRate", completionRate);
        analytics.put("averageDeliveryTimeHours", averageDeliveryTimeHours);

        return analytics;
    }

    @Override
    public ReportType getReportType() {
        return ReportType.SALES_SUMMARY;
    }

    @Override
    public String getGeneratorName() {
        return "SALES_SUMMARY_GENERATOR";
    }

    @Override
    public int getPriority() {
        return 100;
    }

    @Override
    public String getDescription() {
        return "Comprehensive sales analysis with revenue, top products, and customer insights";
    }

    @Override
    public boolean validateParameters(Map<String, Object> parameters) {
        // For one-month reports, parameters are optional
        // If not provided, we'll generate a report for the last 30 days
        if (parameters == null) {
            return true; // Valid, will use default one-month period
        }

        // If parameters are provided, they are optional
        return true;
    }

    @Override
    public String[] getRequiredParameters() {
        // No required parameters for one-month reports
        return new String[]{};
    }

    @Override
    public String[] getOptionalParameters() {
        return new String[]{};
    }
}
