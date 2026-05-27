package com.example.pharmacy.service;

import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * HTML Report Generator Service
 * Generates visual HTML reports with charts and tables
 */
@Service
public class HtmlReportGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss").withZone(ZoneId.systemDefault());

    /**
     * Generate HTML report for Sales Summary
     */
    public String generateSalesSummaryHtml(Map<String, Object> data) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n<head>\n");
        html.append("<meta charset='UTF-8'>\n");
        html.append("<title>Sales Summary Report</title>\n");
        html.append(getStyles());
        html.append("</head>\n<body>\n");
        
        // Header
        html.append("<div class='header'>\n");
        html.append("<h1>📊 Sales Summary Report</h1>\n");
        html.append("<p class='subtitle'>Pharmacy Management System</p>\n");
        
        // Period info
        @SuppressWarnings("unchecked")
        Map<String, Object> period = (Map<String, Object>) data.get("period");
        if (period != null) {
            html.append("<p class='period'>Period: ")
                .append(formatInstant((String) period.get("start")))
                .append(" to ")
                .append(formatInstant((String) period.get("end")))
                .append(" (").append(period.get("days")).append(" days)</p>\n");
        }
        html.append("</div>\n");
        
        // Summary Section
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) data.get("summary");
        if (summary != null) {
            html.append(generateSummarySection(summary));
        }
        
        // Sales Analytics
        @SuppressWarnings("unchecked")
        Map<String, Object> salesAnalytics = (Map<String, Object>) data.get("salesAnalytics");
        if (salesAnalytics != null) {
            html.append(generateSalesAnalyticsSection(salesAnalytics));
        }
        
        // Top Selling Medicines
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topMedicines = 
            (List<Map<String, Object>>) salesAnalytics.get("topSellingMedicines");
        if (topMedicines != null && !topMedicines.isEmpty()) {
            html.append(generateTopMedicinesSection(topMedicines));
        }
        
        // Customer Analytics
        @SuppressWarnings("unchecked")
        Map<String, Object> customerAnalytics = (Map<String, Object>) data.get("customerAnalytics");
        if (customerAnalytics != null) {
            html.append(generateCustomerAnalyticsSection(customerAnalytics));
        }
        
        // Footer
        html.append("<div class='footer'>\n");
        html.append("<p>Generated on: ").append(DATE_FORMATTER.format(Instant.now())).append("</p>\n");
        html.append("<p>Powered by Pharmacy Management System</p>\n");
        html.append("</div>\n");
        
        html.append("</body>\n</html>");
        
        return html.toString();
    }

    /**
     * Generate HTML report for Low Stock
     */
    public String generateLowStockHtml(Map<String, Object> data) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n<head>\n");
        html.append("<meta charset='UTF-8'>\n");
        html.append("<title>Low Stock Report</title>\n");
        html.append(getStyles());
        html.append("</head>\n<body>\n");
        
        // Header
        html.append("<div class='header'>\n");
        html.append("<h1>⚠️ Low Stock & Inventory Report</h1>\n");
        html.append("<p class='subtitle'>Pharmacy Management System</p>\n");
        html.append("</div>\n");
        
        // Summary Section
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) data.get("summary");
        if (summary != null) {
            html.append(generateLowStockSummary(summary));
        }
        
        // Critical Alerts
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> alerts = (List<Map<String, Object>>) data.get("criticalAlerts");
        if (alerts != null && !alerts.isEmpty()) {
            html.append(generateCriticalAlertsSection(alerts));
        }
        
        // Low Stock Items
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> lowStockItems = (List<Map<String, Object>>) data.get("lowStockItems");
        if (lowStockItems != null && !lowStockItems.isEmpty()) {
            html.append(generateLowStockItemsTable(lowStockItems));
        }
        
        // Recommendations
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) data.get("recommendations");
        if (recommendations != null && !recommendations.isEmpty()) {
            html.append(generateRecommendationsSection(recommendations));
        }
        
        // Footer
        html.append("<div class='footer'>\n");
        html.append("<p>Generated on: ").append(DATE_FORMATTER.format(Instant.now())).append("</p>\n");
        html.append("<p>Powered by Pharmacy Management System</p>\n");
        html.append("</div>\n");
        
        html.append("</body>\n</html>");
        
        return html.toString();
    }

    /**
     * Convert HTML to PDF
     */
    public byte[] generatePdfFromHtml(String html) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    // Helper methods for generating sections

    private String generateSummarySection(Map<String, Object> summary) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='summary-section'>\n");
        html.append("<h2>Summary</h2>\n");
        html.append("<div class='summary-grid'>\n");
        
        html.append("<div class='summary-card'>\n");
        html.append("<div class='card-value'>").append(summary.get("totalSales")).append("</div>\n");
        html.append("<div class='card-label'>Total Sales</div>\n");
        html.append("</div>\n");
        
        html.append("<div class='summary-card'>\n");
        html.append("<div class='card-value'>$").append(String.format("%.2f", summary.get("totalRevenue"))).append("</div>\n");
        html.append("<div class='card-label'>Total Revenue</div>\n");
        html.append("</div>\n");
        
        html.append("<div class='summary-card'>\n");
        html.append("<div class='card-value'>$").append(String.format("%.2f", summary.get("averageOrderValue"))).append("</div>\n");
        html.append("<div class='card-label'>Avg Order Value</div>\n");
        html.append("</div>\n");
        
        html.append("</div>\n</div>\n");
        return html.toString();
    }

    private String generateSalesAnalyticsSection(Map<String, Object> analytics) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>Sales Analytics</h2>\n");
        html.append("<table class='data-table'>\n");
        html.append("<tr><th>Metric</th><th>Value</th></tr>\n");
        
        html.append("<tr><td>Total Revenue</td><td>$")
            .append(String.format("%.2f", analytics.get("totalRevenue"))).append("</td></tr>\n");
        html.append("<tr><td>Total Sales Count</td><td>")
            .append(analytics.get("totalSalesCount")).append("</td></tr>\n");
        html.append("<tr><td>Average Order Value</td><td>$")
            .append(String.format("%.2f", analytics.get("averageOrderValue"))).append("</td></tr>\n");
        html.append("<tr><td>Total Items Sold</td><td>")
            .append(analytics.get("totalItemsSold")).append("</td></tr>\n");
        html.append("<tr><td>Unique Customers</td><td>")
            .append(analytics.get("uniqueCustomers")).append("</td></tr>\n");
        html.append("<tr><td>Daily Average Revenue</td><td>$")
            .append(String.format("%.2f", analytics.get("dailyAverageRevenue"))).append("</td></tr>\n");
        html.append("<tr><td>Daily Average Orders</td><td>")
            .append(String.format("%.1f", analytics.get("dailyAverageOrders"))).append("</td></tr>\n");
        
        html.append("</table>\n</div>\n");
        return html.toString();
    }

    private String generateTopMedicinesSection(List<Map<String, Object>> medicines) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>🏆 Top Selling Medicines</h2>\n");
        html.append("<table class='data-table'>\n");
        html.append("<tr><th>Rank</th><th>Medicine</th><th>Category</th><th>Qty Sold</th><th>Revenue</th><th>Stock</th></tr>\n");
        
        for (Map<String, Object> med : medicines) {
            html.append("<tr>");
            html.append("<td class='rank'>").append(med.get("rank")).append("</td>");
            html.append("<td><strong>").append(med.get("name")).append("</strong></td>");
            html.append("<td>").append(med.get("category")).append("</td>");
            html.append("<td>").append(med.get("quantitySold")).append("</td>");
            html.append("<td>$").append(String.format("%.2f", med.get("revenue"))).append("</td>");
            html.append("<td>").append(med.get("currentStock")).append("</td>");
            html.append("</tr>\n");
        }
        
        html.append("</table>\n</div>\n");
        return html.toString();
    }

    private String generateCustomerAnalyticsSection(Map<String, Object> analytics) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>👥 Customer Analytics</h2>\n");
        html.append("<table class='data-table'>\n");
        html.append("<tr><th>Metric</th><th>Value</th></tr>\n");
        
        html.append("<tr><td>Unique Customers</td><td>")
            .append(analytics.get("uniqueCustomers")).append("</td></tr>\n");
        html.append("<tr><td>Average Orders Per Customer</td><td>")
            .append(String.format("%.1f", analytics.get("averageOrdersPerCustomer"))).append("</td></tr>\n");
        
        html.append("</table>\n</div>\n");
        return html.toString();
    }

    private String generateLowStockSummary(Map<String, Object> summary) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='summary-section alert-section'>\n");
        html.append("<h2>Inventory Status</h2>\n");
        html.append("<div class='summary-grid'>\n");
        
        html.append("<div class='summary-card'>\n");
        html.append("<div class='card-value'>").append(summary.get("totalMedicines")).append("</div>\n");
        html.append("<div class='card-label'>Total Medicines</div>\n");
        html.append("</div>\n");
        
        html.append("<div class='summary-card alert-card'>\n");
        html.append("<div class='card-value'>").append(summary.get("lowStockCount")).append("</div>\n");
        html.append("<div class='card-label'>Low Stock</div>\n");
        html.append("</div>\n");
        
        html.append("<div class='summary-card danger-card'>\n");
        html.append("<div class='card-value'>").append(summary.get("outOfStockCount")).append("</div>\n");
        html.append("<div class='card-label'>Out of Stock</div>\n");
        html.append("</div>\n");
        
        html.append("<div class='summary-card warning-card'>\n");
        html.append("<div class='card-value'>").append(summary.get("expiredCount")).append("</div>\n");
        html.append("<div class='card-label'>Expired</div>\n");
        html.append("</div>\n");
        
        html.append("</div>\n</div>\n");
        return html.toString();
    }

    private String generateCriticalAlertsSection(List<Map<String, Object>> alerts) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>🚨 Critical Alerts</h2>\n");
        html.append("<div class='alerts-container'>\n");
        
        for (Map<String, Object> alert : alerts) {
            String severity = (String) alert.get("severity");
            String cssClass = severity.equals("HIGH") ? "alert-high" : "alert-medium";
            
            html.append("<div class='alert ").append(cssClass).append("'>\n");
            html.append("<div class='alert-type'>").append(alert.get("type")).append("</div>\n");
            html.append("<div class='alert-medicine'>").append(alert.get("medicineName")).append("</div>\n");
            html.append("<div class='alert-message'>").append(alert.get("message")).append("</div>\n");
            html.append("</div>\n");
        }
        
        html.append("</div>\n</div>\n");
        return html.toString();
    }

    private String generateLowStockItemsTable(List<Map<String, Object>> items) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>📦 Low Stock Items</h2>\n");
        html.append("<table class='data-table'>\n");
        html.append("<tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Price</th><th>Status</th><th>Expiry Date</th></tr>\n");
        
        for (Map<String, Object> item : items) {
            String status = (String) item.get("status");
            String rowClass = status.equals("OUT_OF_STOCK") ? "danger-row" : "warning-row";
            
            html.append("<tr class='").append(rowClass).append("'>");
            html.append("<td><strong>").append(item.get("name")).append("</strong></td>");
            html.append("<td>").append(item.get("category")).append("</td>");
            html.append("<td>").append(item.get("currentStock")).append("</td>");
            html.append("<td>$").append(String.format("%.2f", item.get("price"))).append("</td>");
            html.append("<td><span class='status-badge'>").append(status.replace("_", " ")).append("</span></td>");
            html.append("<td>").append(item.get("expiryDate") != null ? item.get("expiryDate") : "N/A").append("</td>");
            html.append("</tr>\n");
        }
        
        html.append("</table>\n</div>\n");
        return html.toString();
    }

    private String generateRecommendationsSection(List<String> recommendations) {
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>\n");
        html.append("<h2>💡 Recommendations</h2>\n");
        html.append("<ul class='recommendations'>\n");
        
        for (String rec : recommendations) {
            html.append("<li>").append(rec).append("</li>\n");
        }
        
        html.append("</ul>\n</div>\n");
        return html.toString();
    }

    private String formatInstant(String instantStr) {
        try {
            Instant instant = Instant.parse(instantStr);
            return DATE_FORMATTER.format(instant);
        } catch (Exception e) {
            return instantStr;
        }
    }

    private String getStyles() {
        return "<style>\n" +
            "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }\n" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }\n" +
            ".header h1 { margin: 0; font-size: 32px; }\n" +
            ".subtitle { margin: 10px 0 0 0; opacity: 0.9; }\n" +
            ".period { margin: 15px 0 0 0; font-size: 14px; opacity: 0.8; }\n" +
            ".summary-section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n" +
            ".summary-section h2 { margin-top: 0; color: #333; }\n" +
            ".summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }\n" +
            ".summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }\n" +
            ".card-value { font-size: 36px; font-weight: bold; margin-bottom: 10px; }\n" +
            ".card-label { font-size: 14px; opacity: 0.9; }\n" +
            ".alert-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }\n" +
            ".danger-card { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }\n" +
            ".warning-card { background: linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%); color: #333; }\n" +
            ".section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n" +
            ".section h2 { margin-top: 0; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }\n" +
            ".data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }\n" +
            ".data-table th { background: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; }\n" +
            ".data-table td { padding: 12px; border-bottom: 1px solid #eee; }\n" +
            ".data-table tr:hover { background: #f9f9f9; }\n" +
            ".rank { background: #667eea; color: white; font-weight: bold; text-align: center; border-radius: 50%; width: 30px; height: 30px; line-height: 30px; }\n" +
            ".alerts-container { display: grid; gap: 15px; margin-top: 15px; }\n" +
            ".alert { padding: 15px; border-radius: 8px; border-left: 4px solid; }\n" +
            ".alert-high { background: #fee; border-color: #f44336; }\n" +
            ".alert-medium { background: #fff3cd; border-color: #ffc107; }\n" +
            ".alert-type { font-weight: bold; color: #333; margin-bottom: 5px; }\n" +
            ".alert-medicine { font-size: 16px; font-weight: 600; margin-bottom: 5px; }\n" +
            ".alert-message { font-size: 14px; color: #666; }\n" +
            ".danger-row { background: #fee !important; }\n" +
            ".warning-row { background: #fff3cd !important; }\n" +
            ".status-badge { padding: 4px 8px; border-radius: 4px; background: #667eea; color: white; font-size: 12px; }\n" +
            ".recommendations { list-style: none; padding: 0; }\n" +
            ".recommendations li { background: #f0f7ff; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #667eea; }\n" +
            ".footer { text-align: center; color: #666; margin-top: 30px; padding: 20px; background: white; border-radius: 10px; }\n" +
            ".footer p { margin: 5px 0; }\n" +
            "</style>\n";
    }
}
