package com.example.pharmacy.strategy.report;

import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import java.time.Instant;
import java.util.Map;

/**
 * Strategy Interface for Report Generation
 * Defines the contract for different report generation strategies
 */
public interface ReportGenerator {
    
    /**
     * Generate report based on strategy implementation
     * @param parameters Report generation parameters
     * @return Generated Report entity
     */
    Report generateReport(Map<String, Object> parameters);
    
    /**
     * Get the report type this generator handles
     * @return ReportType enum value
     */
    ReportType getReportType();
    
    /**
     * Get generator name/identifier
     * @return Generator name
     */
    String getGeneratorName();
    
    /**
     * Get generator priority (higher = higher priority)
     * @return Priority value
     */
    int getPriority();
    
    /**
     * Get generator description
     * @return Description text
     */
    String getDescription();
    
    /**
     * Validate parameters before generation
     * @param parameters Parameters to validate
     * @return true if parameters are valid
     * @throws IllegalArgumentException if parameters are invalid
     */
    boolean validateParameters(Map<String, Object> parameters);
    
    /**
     * Get required parameter names for this generator
     * @return Array of required parameter names
     */
    String[] getRequiredParameters();
    
    /**
     * Get optional parameter names for this generator
     * @return Array of optional parameter names
     */
    String[] getOptionalParameters();
}
