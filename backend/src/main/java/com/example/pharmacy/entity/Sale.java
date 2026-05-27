// src/main/java/com/example/pharmacy/entity/Sale.java
package com.example.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sales")
@NamedEntityGraph(
        name = "Sale.withItemsAndUser",
        attributeNodes = {
                @NamedAttributeNode("items"),
                @NamedAttributeNode(value = "user", subgraph = "user-subgraph"),
                @NamedAttributeNode("delivery")
        },
        subgraphs = {
                @NamedSubgraph(
                        name = "user-subgraph",
                        attributeNodes = {
                                @NamedAttributeNode("username"),
                                @NamedAttributeNode("email"),
                                @NamedAttributeNode("role")
                        }
                )
        }
)
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use EAGER fetch for user to avoid N+1 problem
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    // Use EAGER fetch for items to load them with the sale
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("sale")
    @Builder.Default
    private List<SaleItem> items = new ArrayList<>();

    // Use EAGER fetch for delivery
    @OneToOne(mappedBy = "sale", fetch = FetchType.EAGER)
    @JsonIgnoreProperties("sale")
    private Delivery delivery;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SaleStatus status = SaleStatus.PENDING;

    @Column(name = "sale_date", nullable = false, updatable = false)
    @Builder.Default
    private Instant saleDate = Instant.now();

    // Helper methods
    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
    }

    public void removeItem(SaleItem item) {
        items.remove(item);
        item.setSale(null);
    }
}
