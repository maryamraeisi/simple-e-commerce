package com.example.cart.controller;

import com.example.cart.dto.UpdateCartRequest;
import com.example.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @PostMapping("/{productId}/add")
    public ResponseEntity<Void> addCart(@PathVariable Long productId, @RequestBody UpdateCartRequest updateCartRequest) {
        cartService.addCart(productId, updateCartRequest);
        return ResponseEntity.ok().build();
    }
}
