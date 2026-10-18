package com.example.product.controller;

import com.example.product.dto.CreateProductRequest;
import com.example.product.dto.ProductResponse;
import com.example.product.dto.UpdateProductRequest;
import com.example.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> create(@RequestPart("product") CreateProductRequest request,
                                                  @RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(productService.create(request, image));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                  @RequestPart("product") UpdateProductRequest request,
                                                  @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(productService.update(id, request, image));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
