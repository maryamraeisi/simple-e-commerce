package com.example.cart.dto;

import java.util.List;

public record MergeCartItemsRequest(
        List<AddToCartRequest> items
) {
}
