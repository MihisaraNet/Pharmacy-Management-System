// src/main/java/com/example/pharmacy/dto/ReportRequest.java
package com.example.pharmacy.dto;

import com.example.pharmacy.entity.ReportType;
import lombok.Data;
import java.time.Instant;

@Data
public class ReportRequest {
    private ReportType type;
    private Instant start;
    private Instant end;
    private Integer threshold = 10; // Default threshold for low stock
    private String dateRange; // Optional: "WEEK", "MONTH", "QUARTER", "YEAR"
    private String customerId; // Optional: for customer-specific reports
}
