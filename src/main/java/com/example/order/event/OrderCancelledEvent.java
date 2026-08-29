package com.example.order.event;

public record OrderCancelledEvent(
        Long orderId,
        Long customerId,
        String customerEmail
) {}
