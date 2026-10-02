package com.example.inventory.mapper;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;

public class InventoryMapper {

    private InventoryMapper() {}

    public static InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                null,
                inventory.getAtStock(),
                inventory.getAvailable(),
                inventory.getReserved()
        );
    }

    public static InventoryResponse toResponse(Inventory inventory, String productName) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                productName,
                inventory.getAtStock(),
                inventory.getAvailable(),
                inventory.getReserved()
        );
    }
}
