package com.example.inventory.entity;

import com.example.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {@UniqueConstraint(columnNames = "product_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer atStock;
    private Integer available;
    private Integer reserved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;
}
