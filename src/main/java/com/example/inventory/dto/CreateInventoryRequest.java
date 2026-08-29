package com.example.inventory.dto;

public record CreateInventoryRequest(
        Long productId,
        Integer quantity
) {
}
