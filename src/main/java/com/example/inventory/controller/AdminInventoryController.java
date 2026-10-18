package com.example.inventory.controller;

import com.example.inventory.dto.InventoryResponse;
import com.example.inventory.dto.UpdateStockRequest;
import com.example.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryResponse>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/products/{productId}/inventory")
    public ResponseEntity<InventoryResponse> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/products/{productId}/inventory")
    public ResponseEntity<InventoryResponse> updateStock(@PathVariable Long productId,
                                                         @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, request.quantityChange()));
    }
}