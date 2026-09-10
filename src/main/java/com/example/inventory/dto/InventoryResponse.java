package com.example.inventory.dto;

public record InventoryResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Integer reservedQuantity
) {}
