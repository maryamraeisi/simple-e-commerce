package com.example.inventory.service;

import com.example.inventory.dto.CreateInventoryRequest;
import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;
import com.example.inventory.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryResponse createInventory(CreateInventoryRequest request) {

        if (inventoryRepository.findByProductId(request.productId()).isPresent()) {
            throw new IllegalArgumentException("Inventory already exists for product: " + request.productId());
        }

        Inventory inventory = Inventory.builder()
                .productId(request.productId())
                .quantity(request.quantity())
                .reservedQuantity(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toResponse(inventoryRepository.save(inventory));
    }

    public InventoryResponse addStock(Long productId, Integer quantity) {
        Inventory inventory = getInventory(productId);

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        return toResponse(inventoryRepository.save(inventory));
    }

    public InventoryResponse reserveStock(Long productId, Integer quantity) {
        Inventory inventory = getInventory(productId);

        int availableStock = inventory.getQuantity() - inventory.getReservedQuantity();

        if (availableStock < quantity) {
            throw new IllegalStateException("Not enough stock for product: " + productId);
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        return toResponse(inventoryRepository.save(inventory));
    }

    public InventoryResponse releaseStock(Long productId, Integer quantity) {
        Inventory inventory = getInventory(productId);

        if (inventory.getReservedQuantity() < quantity) {
            throw new IllegalStateException("Cannot release more stock than reserved");
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        return toResponse(inventoryRepository.save(inventory));
    }

    private Inventory getInventory(Long productId) {
        return inventoryRepository.findByProductId(productId).orElseThrow(() ->
                        new IllegalArgumentException("Inventory not found for product: " + productId));
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProductId(),
                inventory.getQuantity(),
                inventory.getReservedQuantity()
        );
    }
}
