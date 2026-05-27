package com.example.pharmacy.strategy.report;

import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Report Generator Manager - Context Class for Report Generation Strategy Pattern
 * Implements Classic Singleton Pattern with Spring Integration
 * Manages multiple report generators and delegates report generation to appropriate strategies
 */
@Component
public class ReportGeneratorManager {

    // Classic Singleton instance
    private static ReportGeneratorManager instance;
    private static final Object lock = new Object();

    private final Map<ReportType, ReportGenerator> generatorMap;
    private final List<ReportGenerator> allGenerators;

    /**
     * Private constructor for Singleton pattern
     * Also supports Spring dependency injection
     */
    @Autowired
    private ReportGeneratorManager(List<ReportGenerator> generators) {
        // Thread-safe singleton initialization
        synchronized (lock) {
            if (instance != null) {
                throw new IllegalStateException("ReportGeneratorManager instance already exists!");
            }
            instance = this;
        }

        this.allGenerators = generators;
        this.generatorMap = generators.stream()
                .collect(Collectors.toMap(
                        ReportGenerator::getReportType,
                        generator -> generator,
                        (existing, replacement) -> existing.getPriority() > replacement.getPriority() ? existing : replacement
                ));

        System.out.println("🚀 Report Generator Manager (Singleton) initialized with " + generators.size() + " generators");
        generators.forEach(gen -> 
            System.out.println("   📊 " + gen.getGeneratorName() + " (Priority: " + gen.getPriority() + ")")
        );
    }

    /**
     * Classic Singleton getInstance method
     * Thread-safe with double-checked locking
     * @return The singleton instance
     * @throws IllegalStateException if instance is not initialized by Spring
     */
    public static ReportGeneratorManager getInstance() {
        if (instance == null) {
            synchronized (lock) {
                if (instance == null) {
                    throw new IllegalStateException(
                        "ReportGeneratorManager not initialized. " +
                        "Ensure Spring context is loaded before calling getInstance()."
                    );
                }
            }
        }
        return instance;
    }

    /**
     * Check if singleton instance is initialized
     * @return true if instance exists
     */
    public static boolean isInitialized() {
        return instance != null;
    }

    /**
     * Generate report using appropriate strategy
     */
    public Report generateReport(ReportType reportType, Map<String, Object> parameters) {
        ReportGenerator generator = generatorMap.get(reportType);

        if (generator == null) {
            throw new IllegalArgumentException("No generator found for report type: " + reportType);
        }

        System.out.println("📄 Generating " + reportType + " report using " + generator.getGeneratorName());
        
        try {
            return generator.generateReport(parameters);
        } catch (Exception e) {
            System.err.println("❌ Error generating report: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Get generator for specific report type
     */
    public ReportGenerator getGenerator(ReportType reportType) {
        ReportGenerator generator = generatorMap.get(reportType);
        if (generator == null) {
            throw new IllegalArgumentException("No generator found for report type: " + reportType);
        }
        return generator;
    }

    /**
     * Get all available generators
     */
    public List<ReportGenerator> getAllGenerators() {
        return new ArrayList<>(allGenerators);
    }

    /**
     * Get generators sorted by priority
     */
    public List<ReportGenerator> getGeneratorsByPriority() {
        return allGenerators.stream()
                .sorted(Comparator.comparing(ReportGenerator::getPriority).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get available report types
     */
    public List<ReportType> getAvailableReportTypes() {
        return new ArrayList<>(generatorMap.keySet());
    }

    /**
     * Get generator information for a report type
     */
    public Map<String, Object> getGeneratorInfo(ReportType reportType) {
        ReportGenerator generator = getGenerator(reportType);

        Map<String, Object> info = new HashMap<>();
        info.put("reportType", reportType);
        info.put("generatorName", generator.getGeneratorName());
        info.put("description", generator.getDescription());
        info.put("priority", generator.getPriority());
        info.put("requiredParameters", generator.getRequiredParameters());
        info.put("optionalParameters", generator.getOptionalParameters());

        return info;
    }

    /**
     * Get information for all generators
     */
    public List<Map<String, Object>> getAllGeneratorsInfo() {
        return allGenerators.stream()
                .map(gen -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("reportType", gen.getReportType());
                    info.put("generatorName", gen.getGeneratorName());
                    info.put("description", gen.getDescription());
                    info.put("priority", gen.getPriority());
                    info.put("requiredParameters", gen.getRequiredParameters());
                    info.put("optionalParameters", gen.getOptionalParameters());
                    return info;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("priority"), (Integer) a.get("priority")))
                .collect(Collectors.toList());
    }

    /**
     * Validate parameters for specific report type
     */
    public boolean validateParameters(ReportType reportType, Map<String, Object> parameters) {
        ReportGenerator generator = getGenerator(reportType);
        return generator.validateParameters(parameters);
    }

    /**
     * Get statistics about the report generation system
     */
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalGenerators", allGenerators.size());
        stats.put("availableReportTypes", generatorMap.keySet());
        stats.put("generatorsByType", 
            generatorMap.entrySet().stream()
                .collect(Collectors.toMap(
                    entry -> entry.getKey().toString(),
                    entry -> entry.getValue().getGeneratorName()
                ))
        );

        Map<String, Long> priorityDistribution = allGenerators.stream()
                .collect(Collectors.groupingBy(
                    gen -> "Priority " + gen.getPriority(),
                    Collectors.counting()
                ));
        stats.put("priorityDistribution", priorityDistribution);

        return stats;
    }

    /**
     * Check if generator exists for report type
     */
    public boolean hasGenerator(ReportType reportType) {
        return generatorMap.containsKey(reportType);
    }

    /**
     * Get required parameters for a report type
     */
    public String[] getRequiredParameters(ReportType reportType) {
        return getGenerator(reportType).getRequiredParameters();
    }

    /**
     * Get optional parameters for a report type
     */
    public String[] getOptionalParameters(ReportType reportType) {
        return getGenerator(reportType).getOptionalParameters();
    }

    /**
     * Get singleton instance information
     * @return Map with singleton details
     */
    public Map<String, Object> getSingletonInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("pattern", "Classic Singleton");
        info.put("instanceHashCode", this.hashCode());
        info.put("isInitialized", isInitialized());
        info.put("isSameInstance", this == getInstance());
        info.put("threadSafe", true);
        info.put("description", "Thread-safe Singleton with double-checked locking and Spring integration");
        return info;
    }

    /**
     * Prevent cloning of singleton instance
     */
    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException("Cannot clone singleton ReportGeneratorManager");
    }
}
