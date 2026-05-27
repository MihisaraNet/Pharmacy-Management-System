package com.example.pharmacy.service;

import com.example.pharmacy.entity.*;
import com.example.pharmacy.repository.*;
import com.example.pharmacy.strategy.report.ReportGeneratorManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReportGeneratorManager reportGeneratorManager;

    @Autowired
    private HtmlReportGenerator htmlReportGenerator;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // =======================================
    // REPORT GENERATOR MANAGER METHODS
    // =======================================

    /**
     * Generate report using Report Generator Manager
     */
    public Report generateReportWithManager(ReportType reportType, Map<String, Object> parameters) {
        System.out.println("🎯 ReportService: Generating " + reportType + " report using Report Generator Manager");
        return reportGeneratorManager.generateReport(reportType, parameters);
    }

    /**
     * Get all available report generators info
     */
    public List<Map<String, Object>> getAvailableGenerators() {
        return reportGeneratorManager.getAllGeneratorsInfo();
    }

    /**
     * Get generator info for specific report type
     */
    public Map<String, Object> getGeneratorInfo(ReportType reportType) {
        return reportGeneratorManager.getGeneratorInfo(reportType);
    }

    /**
     * Get report generator system statistics
     */
    public Map<String, Object> getGeneratorStatistics() {
        return reportGeneratorManager.getSystemStatistics();
    }

    /**
     * Validate parameters for report type
     */
    public boolean validateReportParameters(ReportType reportType, Map<String, Object> parameters) {
        return reportGeneratorManager.validateParameters(reportType, parameters);
    }

    /**
     * Get singleton instance information
     */
    public Map<String, Object> getSingletonInfo() {
        return reportGeneratorManager.getSingletonInfo();
    }

    /**
     * Verify singleton pattern is working
     */
    public Map<String, Object> verifySingletonPattern() {
        Map<String, Object> verification = new HashMap<>();
        
        // Get instance through Spring injection
        ReportGeneratorManager springInstance = reportGeneratorManager;
        
        // Get instance through Singleton pattern
        ReportGeneratorManager singletonInstance = ReportGeneratorManager.getInstance();
        
        verification.put("springInstanceHashCode", springInstance.hashCode());
        verification.put("singletonInstanceHashCode", singletonInstance.hashCode());
        verification.put("areSameInstance", springInstance == singletonInstance);
        verification.put("isInitialized", ReportGeneratorManager.isInitialized());
        verification.put("pattern", "Classic Singleton Pattern with Spring Integration");
        verification.put("verified", springInstance == singletonInstance);
        
        return verification;
    }

    // =======================================
    // VISUAL REPORT GENERATION
    // =======================================

    /**
     * Generate HTML report
     */
    public String generateHtmlReport(ReportType reportType, Map<String, Object> parameters) {
        System.out.println("🎨 Generating HTML report for: " + reportType);
        
        // Generate report data using strategy pattern
        Report report = reportGeneratorManager.generateReport(reportType, parameters);
        
        try {
            // Parse JSON content
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(report.getContent(), Map.class);
            
            // Generate HTML based on report type
            switch (reportType) {
                case SALES_SUMMARY:
                    return htmlReportGenerator.generateSalesSummaryHtml(data);
                case LOW_STOCK:
                    return htmlReportGenerator.generateLowStockHtml(data);
                default:
                    throw new IllegalArgumentException("HTML generation not supported for: " + reportType);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error generating HTML report: " + e.getMessage(), e);
        }
    }

    /**
     * Generate PDF report
     */
    public byte[] generatePdfReport(ReportType reportType, Map<String, Object> parameters) {
        System.out.println("📄 Generating PDF report for: " + reportType);
        
        // First generate HTML
        String html = generateHtmlReport(reportType, parameters);
        
        // Convert to PDF
        return htmlReportGenerator.generatePdfFromHtml(html);
    }

    // =======================================
    // CRUD OPERATIONS
    // =======================================

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
    }

    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
    }

    public List<Report> getReportsByType(ReportType type) {
        return reportRepository.findByReportType(type);
    }

    // =======================================
    // LEGACY REPORT GENERATION (kept for backward compatibility)
    // =======================================

    public Report generateSalesSummary(Instant start, Instant end) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("start", start);
        parameters.put("end", end);
        return reportGeneratorManager.generateReport(ReportType.SALES_SUMMARY, parameters);
    }

    public Report generateLowStockReport(Integer threshold) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("threshold", threshold != null ? threshold : 10);
        return reportGeneratorManager.generateReport(ReportType.LOW_STOCK, parameters);
    }
}
