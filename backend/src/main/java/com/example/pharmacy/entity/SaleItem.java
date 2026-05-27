package com.example.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;



@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "sale_items")
public class SaleItem {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnoreProperties("items")
    private Sale sale;

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @ManyToOne(optional = false) @JoinColumn(name = "sale_id")
//    private Sale sale;

    @ManyToOne(optional = false) @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
}
