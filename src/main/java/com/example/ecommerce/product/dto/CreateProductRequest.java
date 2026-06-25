package com.example.ecommerce.product.dto;

import java.math.BigDecimal;

public record CreateProductRequest(
        String name,
        String description,
        BigDecimal price,
        String imageUrl
) {}
