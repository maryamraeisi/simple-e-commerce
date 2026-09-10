package com.example.inventory.mapper;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;

public class InventoryMapper {

    private InventoryMapper() {}

    public static InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProductId(),
                null,
                inventory.getQuantity(),
                inventory.getReservedQuantity()
        );
    }

    public static InventoryResponse toResponse(Inventory inventory, String productName) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProductId(),
                productName,
                inventory.getQuantity(),
                inventory.getReservedQuantity()
        );
    }
}
