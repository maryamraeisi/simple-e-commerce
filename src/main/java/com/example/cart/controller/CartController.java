package com.example.cart.controller;

import com.example.cart.dto.AddToCartRequest;
import com.example.cart.dto.MergeCartItemsRequest;
import com.example.cart.dto.UpdateCartItemRequest;
import com.example.cart.dto.CartResponse;
import com.example.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getUserCart() {
        return ResponseEntity.ok(cartService.getUserCart());
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<Void> changeItemQuantity(@PathVariable(name = "id") Long itemId,
                                               @RequestBody UpdateCartItemRequest request) {
        cartService.changeItemQuantity(itemId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable(name = "id") Long itemId) {
        cartService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> deleteAllItems() {
        cartService.deleteAllItems();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge")
    public ResponseEntity<CartResponse> mergeItems(@Valid @RequestBody MergeCartItemsRequest request) {
        return ResponseEntity.ok(cartService.mergeItems(request));
    }

}
