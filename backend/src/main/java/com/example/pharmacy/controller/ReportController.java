// src/main/java/com/example/pharmacy/controller/ReportController.java
package com.example.pharmacy.controller;

import com.example.pharmacy.dto.ReportRequest;
import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import com.example.pharmacy.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // =======================================
    // REPORT GENERATOR MANAGER ENDPOINTS
    // =======================================

    /**
     * Generate report using Report Generator Manager
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<Report> generateReportWithManager(@RequestBody Map<String, Object> request) {
        try {
            String reportTypeStr = (String) request.get("reportType");
            ReportType reportType = ReportType.valueOf(reportTypeStr);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> parameters = (Map<String, Object>) request.getOrDefault("parameters", new HashMap<>());
            
            Report report = reportService.generateReportWithManager(reportType, parameters);
            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available report generators
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/generators")
    public ResponseEntity<List<Map<String, Object>>> getAvailableGenerators() {
        try {
            List<Map<String, Object>> generators = reportService.getAvailableGenerators();
            return ResponseEntity.ok(generators);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get generator info for specific report type
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/generators/{reportType}")
    public ResponseEntity<Map<String, Object>> getGeneratorInfo(@PathVariable ReportType reportType) {
        try {
            Map<String, Object> info = reportService.getGeneratorInfo(reportType);
            return ResponseEntity.ok(info);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get generator system statistics
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/generators/stats")
    public ResponseEntity<Map<String, Object>> getGeneratorStatistics() {
        try {
            Map<String, Object> stats = reportService.getGeneratorStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // =======================================
    // LEGACY ENDPOINTS (backward compatibility)
    // =======================================

    // Generate Reports
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Report> generateReport(@RequestBody ReportRequest request) {
        try {
            Report report = switch (request.getType()) {
                case SALES_SUMMARY -> reportService.generateSalesSummary(
                        request.getStart(),
                        request.getEnd()
                );
                case LOW_STOCK -> reportService.generateLowStockReport(
                        request.getThreshold() != null ? request.getThreshold() : 10
                );
                default -> throw new IllegalArgumentException("Unsupported report type: " + request.getType());
            };

            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get All Reports
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        try {
            List<Report> reports = reportService.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Report by ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        try {
            Report report = reportService.getReportById(id);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete Report
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Reports by Type
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable ReportType type) {
        try {
            List<Report> reports = reportService.getReportsByType(type);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Quick Generate Sales Summary (with default date range - last 30 days)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/quick/sales")
    public ResponseEntity<Report> quickSalesSummary() {
        try {
            java.time.Instant end = java.time.Instant.now();
            java.time.Instant start = end.minus(30, java.time.temporal.ChronoUnit.DAYS);

            Report report = reportService.generateSalesSummary(start, end);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Quick Generate Low Stock Report (with default threshold)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/quick/lowstock")
    public ResponseEntity<Report> quickLowStockReport() {
        try {
            Report report = reportService.generateLowStockReport(10);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Demo endpoint to test Report Generator Manager (public access)
     */
    @GetMapping("/demo")
    public ResponseEntity<Map<String, Object>> demoReportGeneratorManager() {
        try {
            Map<String, Object> demo = new HashMap<>();
            
            // Get system statistics
            Map<String, Object> stats = reportService.getGeneratorStatistics();
            demo.put("systemStatistics", stats);
            
            // Get available generators
            List<Map<String, Object>> generators = reportService.getAvailableGenerators();
            demo.put("availableGenerators", generators);
            
            demo.put("status", "Report Generator Manager is active");
            demo.put("message", "Use POST /api/reports/generate to create reports with the Report Generator Manager");
            
            return ResponseEntity.ok(demo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get Singleton instance information (public access)
     */
    @GetMapping("/singleton")
    public ResponseEntity<Map<String, Object>> getSingletonInfo() {
        try {
            Map<String, Object> info = reportService.getSingletonInfo();
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify Singleton pattern is working correctly (public access)
     */
    @GetMapping("/singleton/verify")
    public ResponseEntity<Map<String, Object>> verifySingletonPattern() {
        try {
            Map<String, Object> verification = reportService.verifySingletonPattern();
            return ResponseEntity.ok(verification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =======================================
    // VISUAL REPORT ENDPOINTS
    // =======================================

    /**
     * Generate HTML report (public for demo)
     */
    @PostMapping("/html")
    public ResponseEntity<String> generateHtmlReport(@RequestBody Map<String, Object> request) {
        try {
            String reportTypeStr = (String) request.get("reportType");
            ReportType reportType = ReportType.valueOf(reportTypeStr);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> parameters = (Map<String, Object>) request.getOrDefault("parameters", new HashMap<>());
            
            String html = reportService.generateHtmlReport(reportType, parameters);
            
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_PLAIN)
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Generate PDF report
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/pdf")
    public ResponseEntity<byte[]> generatePdfReport(@RequestBody Map<String, Object> request) {
        try {
            String reportTypeStr = (String) request.get("reportType");
            ReportType reportType = ReportType.valueOf(reportTypeStr);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> parameters = (Map<String, Object>) request.getOrDefault("parameters", new HashMap<>());
            
            byte[] pdf = reportService.generatePdfReport(reportType, parameters);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", reportType + "_report.pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Quick HTML Sales Report (last 30 days) - public for demo
     */
    @GetMapping("/html/sales")
    public ResponseEntity<String> quickHtmlSalesReport() {
        try {
            Map<String, Object> parameters = new HashMap<>();
            java.time.Instant end = java.time.Instant.now();
            java.time.Instant start = end.minus(30, java.time.temporal.ChronoUnit.DAYS);
            parameters.put("start", start);
            parameters.put("end", end);
            
            String html = reportService.generateHtmlReport(ReportType.SALES_SUMMARY, parameters);
            
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_PLAIN)
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Quick HTML Low Stock Report - public for demo
     */
    @GetMapping("/html/lowstock")
    public ResponseEntity<String> quickHtmlLowStockReport() {
        try {
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("threshold", 10);
            
            String html = reportService.generateHtmlReport(ReportType.LOW_STOCK, parameters);
            
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_PLAIN)
                .body("Error: " + e.getMessage());
        }
    }
}
