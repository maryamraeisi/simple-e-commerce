package com.example.inventory.controller;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.dto.UpdateStockRequest;
import com.example.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @PostMapping("/{productId}/add")
    public ResponseEntity<InventoryResponse> addStock(@PathVariable Long productId,
                                                      @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(inventoryService.addStock(productId, request.quantity()));
    }

    @PostMapping("/{orderId}/reserve")
    public ResponseEntity<List<InventoryResponse>> reserve(@PathVariable Long orderId) {

        return ResponseEntity.ok(inventoryService.reserveStock(orderId));
    }

    @PostMapping("/{orderId}/release")
    public ResponseEntity<List<InventoryResponse>> release(@PathVariable Long orderId) {
        return ResponseEntity.ok(inventoryService.releaseStock(orderId));
    }
}
