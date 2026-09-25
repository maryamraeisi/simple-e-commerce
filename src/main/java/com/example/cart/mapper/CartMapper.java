package com.example.cart.mapper;

import com.example.cart.dto.CartItemResponse;
import com.example.cart.dto.CartResponse;
import com.example.cart.entity.Cart;

import java.util.List;

public class CartMapper {

    private CartMapper() {}

    public static CartResponse toResponse(Cart cart) {
        List<CartItemResponse> cartItemResponses = cart.getCartItems().stream()
                .map(cartItem -> new CartItemResponse(
                        cartItem.getId(),
                        cartItem.getProduct().getId(),
                        cartItem.getProduct().getName(),
                        cartItem.getProduct().getPrice(),
                        cartItem.getProduct().getImageUrl(),
                        cartItem.getQuantity()))
                .toList();

        return new CartResponse(cartItemResponses);
    }
}
