package com.example.infrastructure.messaging.event;

public record OrderCancelledEvent(
        Long orderId,
        Long customerId,
        String customerEmail
) {}
