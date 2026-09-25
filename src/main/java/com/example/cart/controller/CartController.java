package com.example.cart.controller;

import com.example.cart.dto.AddToCartRequest;
import com.example.cart.dto.UpdateCartItemRequest;
import com.example.cart.dto.CartResponse;
import com.example.cart.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<CartResponse> getUserCart(HttpServletRequest httpRequest,
                                                    HttpServletResponse httpResponse) {
        return ResponseEntity.ok(cartService.getUserCart(httpRequest, httpResponse));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest addToCartRequest,
                                                  HttpServletRequest httpRequest,
                                                  HttpServletResponse httpResponse) {
        return ResponseEntity.ok(cartService.addToCart(addToCartRequest, httpRequest, httpResponse));
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<Void> changeItemQuantity(@PathVariable(name = "id") Long itemId,
                                                   @Valid @RequestBody UpdateCartItemRequest updateCartItemRequest,
                                                   HttpServletRequest httpRequest,
                                                   HttpServletResponse httpResponse) {
        cartService.changeItemQuantity(itemId, updateCartItemRequest, httpRequest, httpResponse);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable(name = "id") Long itemId,
                                           HttpServletRequest httpRequest,
                                           HttpServletResponse httpResponse) {
        cartService.deleteItem(itemId, httpRequest, httpResponse);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> deleteAllItems(HttpServletRequest httpRequest,
                                               HttpServletResponse httpResponse) {
        cartService.deleteAllItems(httpRequest, httpResponse);
        return ResponseEntity.noContent().build();
    }

}
