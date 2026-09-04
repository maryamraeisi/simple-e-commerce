package com.example.inventory.mapper;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;

public class InventoryMapper {

    private InventoryMapper() {}

    public static InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProductId(),
                inventory.getQuantity(),
                inventory.getReservedQuantity()
        );
    }
}
