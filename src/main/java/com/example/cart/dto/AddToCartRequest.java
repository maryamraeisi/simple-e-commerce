package com.example.cart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record AddToCartRequest(
        @NotBlank Long productId,
        @Positive Integer quantity
) {
}
