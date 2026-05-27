// src/main/java/com/example/pharmacy/repository/ReportRepository.java
package com.example.pharmacy.repository;

import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // Find reports by type
    List<Report> findByReportType(ReportType type);

    // Find reports within date range
    List<Report> findByGeneratedDateBetween(Instant start, Instant end);

    // Find recent reports (last 30 days)
    @Query("SELECT r FROM Report r WHERE r.generatedDate >= :date ORDER BY r.generatedDate DESC")
    List<Report> findRecentReports(@Param("date") Instant date);

    // Find reports by type within date range
    @Query("SELECT r FROM Report r WHERE r.reportType = :type AND r.generatedDate BETWEEN :start AND :end ORDER BY r.generatedDate DESC")
    List<Report> findByTypeAndDateRange(@Param("type") ReportType type, @Param("start") Instant start, @Param("end") Instant end);

    // Count reports by type
    Long countByReportType(ReportType type);
}
