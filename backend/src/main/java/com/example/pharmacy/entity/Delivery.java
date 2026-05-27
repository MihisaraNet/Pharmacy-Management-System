// src/main/java/com/example/pharmacy/entity/Delivery.java
package com.example.pharmacy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnoreProperties("delivery")
    private Sale sale;

    @Column(nullable = false, length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "delivery_date")
    private Instant deliveryDate;
}
