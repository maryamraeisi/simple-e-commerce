package com.example.inventory.controller;

import com.example.inventory.dto.CreateInventoryRequest;
import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.dto.UpdateStockRequest;
import com.example.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryResponse> create(@RequestBody CreateInventoryRequest request) {
        return ResponseEntity.ok(inventoryService.createInventory(request));
    }

    @PostMapping("/{productId}/add")
    public ResponseEntity<InventoryResponse> addStock(@PathVariable Long productId,
                                                      @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(inventoryService.addStock(productId, request.quantity()));
    }

    @PostMapping("/{productId}/reserve")
    public ResponseEntity<InventoryResponse> reserve(@PathVariable Long productId,
                                                     @RequestBody UpdateStockRequest request) {

        return ResponseEntity.ok(inventoryService.reserveStock(productId, request.quantity()));
    }

    @PostMapping("/{productId}/release")
    public ResponseEntity<InventoryResponse> release(@PathVariable Long productId,
                                                     @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(inventoryService.releaseStock(productId, request.quantity()));
    }
}
