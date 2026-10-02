package com.example.inventory.service;

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

    public InventoryResponse getByProductId(Long productId) {
        Inventory inventory = getInventory(productId);
        return InventoryMapper.toResponse(inventory, inventory.getProduct().getName());
    }

    public List<InventoryResponse> getAll() {
        List<InventoryResponse> inventoryResponseList = new LinkedList<>();
        List<Inventory> inventoryList = inventoryRepository.findAllWithProduct();
        for (Inventory inventory : inventoryList) {
            InventoryResponse inventoryResponse =
                    InventoryMapper.toResponse(inventory, inventory.getProduct().getName());
            inventoryResponseList.add(inventoryResponse);
        }
        return inventoryResponseList;
    }

    public InventoryResponse updateStock(Long productId, Integer quantityChange) {
        if (quantityChange == null || quantityChange == 0) {
            throw new IllegalArgumentException("Stock quantityChange must not be null or zero");
        }

        Inventory inventory = getInventoryForUpdate(productId);
        int newAtStock = inventory.getAtStock() + quantityChange;
        int newAvailable = inventory.getAvailable() + quantityChange;

        if (newAvailable < 0) {
            throw new IllegalArgumentException("Cannot reduce stock below the currently reserved stock");
        }

        inventory.setAtStock(newAtStock);
        inventory.setAvailable(newAvailable);
        inventory.setUpdatedAt(LocalDateTime.now());
        return InventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    public void reserveStock(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        for (OrderItem item : order.getItems()) {
            reserveOrderItem(item);
        }
    }

    private void reserveOrderItem(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();
        Inventory inventory = getInventoryForUpdate(productId);

        if (inventory.getAvailable() < quantity) {
            throw new IllegalStateException("Not enough stock for product: " + productId);
        }

        inventory.setAvailable(inventory.getAvailable() - quantity);
        inventory.setReserved(inventory.getReserved() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }

    public void releaseStock(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        for (OrderItem item : order.getItems()) {
            releaseOrderItem(item);
        }
    }

    private void releaseOrderItem(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();
        Inventory inventory = getInventoryForUpdate(productId);

        if (inventory.getReserved() < quantity) {
            throw new IllegalStateException("Cannot release more stock than reserved");
        }

        inventory.setReserved(inventory.getReserved() - quantity);
        inventory.setAvailable(inventory.getAvailable() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }

    public void confirmReservation(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        for (OrderItem item : order.getItems()) {
            confirmOrderItem(item);
        }
    }

    private void confirmOrderItem(OrderItem item) {
        Long productId = item.getProductId();
        Integer quantity = item.getQuantity();
        Inventory inventory = getInventoryForUpdate(productId);

        if (inventory.getReserved() < quantity) {
            throw new IllegalStateException("Cannot confirm more stock than reserved");
        }

        inventory.setAtStock(inventory.getAtStock() - quantity);
        inventory.setReserved(inventory.getReserved() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }

    private Inventory getInventory(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Inventory does not exist for product: " + productId));
    }

    private Inventory getInventoryForUpdate(Long productId) {
        return inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Inventory does not exist for product: " + productId));
    }
}