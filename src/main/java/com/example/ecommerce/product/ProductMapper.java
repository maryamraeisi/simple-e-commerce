package com.example.ecommerce.product;

import com.example.ecommerce.product.dto.ProductResponse;

public class ProductMapper {

    private ProductMapper() {}

    public static ProductResponse toResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.isActive()
        );
    }
}
