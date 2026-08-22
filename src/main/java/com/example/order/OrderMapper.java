package com.example.order;

import com.example.order.dto.*;
import com.example.order.dto.OrderItemResponse;
import com.example.order.dto.OrderResponse;

public class OrderMapper {

    private OrderMapper() {}

    public static OrderResponse toResponse(Order order) {

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getCreatedAt(),
                order.getItems()
                        .stream()
                        .map(item -> new OrderItemResponse(
                                item.getProductId(),
                                item.getProductName(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()
                        ))
                        .toList()
        );
    }
}