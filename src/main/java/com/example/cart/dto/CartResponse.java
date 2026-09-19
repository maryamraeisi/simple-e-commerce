package com.example.cart.dto;

import java.util.List;

public record CartResponse(
        List<CartItemResponse> items
) {
}
