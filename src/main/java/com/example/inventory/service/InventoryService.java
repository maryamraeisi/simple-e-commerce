package com.example.inventory.service;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.entity.Inventory;
import com.example.inventory.mapper.InventoryMapper;
import com.example.inventory.repository.InventoryRepository;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.service.OrderService;
import com.example.product.entity.Product;
import com.example.product.service.ProductService;
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
            InventoryResponse inventoryResponse = InventoryMapper.toResponse(inventory, inventory.getProduct().getName());
            inventoryResponseList.add(inventoryResponse);
        }
        return inventoryResponseList;
    }

    public InventoryResponse addStock(Long productId, Integer quantity) {
        Inventory inventory = getInventory(productId);

        if (inventory == null) {
            throw new IllegalArgumentException("Inventory does not exist for product: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() + quantity);

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

        inventory.setQuantity(inventory.getQuantity());
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

        inventory.setQuantity(inventory.getQuantity());
        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);

        return inventory;
    }

    private Inventory getInventory(Long productId) {
        return inventoryRepository.findByProductId(productId).orElse(null);
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

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventory.setUpdatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);
    }

}
