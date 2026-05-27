// src/main/java/com/example/pharmacy/entity/Report.java
package com.example.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "generated_date", nullable = false, updatable = false)
    @Builder.Default
    private Instant generatedDate = Instant.now();

    // 🔧 FIX: Change from @Lob to @Column with LONGTEXT
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;
}
