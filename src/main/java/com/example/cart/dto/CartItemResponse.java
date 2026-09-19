package com.example.cart.dto;

public record CartItemResponse(
        Long productId,
        Integer quantity
) {
}
