package com.example.product.controller;

import com.example.product.service.ProductService;
import com.example.product.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

}