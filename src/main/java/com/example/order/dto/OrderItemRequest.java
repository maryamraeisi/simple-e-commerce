package com.example.order.dto;

public record OrderItemRequest(
        Long productId,
        Integer quantity
) {}