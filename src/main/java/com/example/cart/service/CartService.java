package com.example.cart.service;

import com.example.cart.dto.AddToCartRequest;
import com.example.cart.dto.CartResponse;
import com.example.cart.dto.MergeCartItemsRequest;
import com.example.cart.dto.UpdateCartItemRequest;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    public CartResponse addToCart(AddToCartRequest request) {
        return null;
    }

    public void changeItemQuantity(Long itemId, UpdateCartItemRequest request) {

    }

    public void deleteItem(Long itemId) {

    }

    public void deleteAllItems() {

    }

    public CartResponse getUserCart() {
        return null;
    }

    public CartResponse mergeItems(MergeCartItemsRequest request) {
        return null;
    }
}
