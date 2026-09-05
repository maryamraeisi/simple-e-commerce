package com.example.inventory.service;

import com.example.inventory.dto.CreateInventoryRequest;
import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;
import com.example.inventory.mapper.InventoryMapper;
import com.example.inventory.repository.InventoryRepository;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final OrderService orderService;

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

        return InventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    public InventoryResponse addStock(Long productId, Integer quantity) {
        Inventory inventory = getInventory(productId);

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        return InventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    public List<InventoryResponse> reserveStock(Long orderId) {
        Order order = orderService.getOrderById(orderId);

        List<InventoryResponse> inventoryResponses = new LinkedList<>();

        for (OrderItem item : order.getItems()) {
            Inventory updated = reserveOrderItems(item);
            inventoryResponses.add(InventoryMapper.toResponse(updated));
        }
        return inventoryResponses;
    }

    private Inventory reserveOrderItems(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();

        Inventory inventory = getInventory(productId);

        int availableStock = inventory.getQuantity() - inventory.getReservedQuantity();

        if (availableStock < quantity) {
            throw new IllegalStateException("Not enough stock for product: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);

        return inventory;
    }

    public List<InventoryResponse> releaseStock(Long orderId) {
        Order order = orderService.getOrderById(orderId);

        List<InventoryResponse> inventoryResponses = new LinkedList<>();

        for (OrderItem item : order.getItems()) {
            Inventory updated = releaseOrderItems(item);
            inventoryResponses.add(InventoryMapper.toResponse(updated));
        }
        return inventoryResponses;
    }

    private Inventory releaseOrderItems(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();

        Inventory inventory = getInventory(productId);

        if (inventory.getReservedQuantity() < quantity) {
            throw new IllegalStateException("Cannot release more stock than reserved");
        }

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);

        return inventory;
    }

    private Inventory getInventory(Long productId) {
        return inventoryRepository.findByProductId(productId).orElseThrow(() ->
                        new IllegalArgumentException("Inventory not found for product: " + productId));
    }

    public void purchaseConfirmed(Long orderId) {
        Order order = orderService.getOrderById(orderId);

        for (OrderItem item : order.getItems()) {
            purchaseConfirmedForOrderItems(item);
        }
    }

    private void purchaseConfirmedForOrderItems(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();

        Inventory inventory = getInventory(productId);

        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);
    }
}
