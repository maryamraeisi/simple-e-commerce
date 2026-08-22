package com.example.infrastructure.messaging.event;

import java.math.BigDecimal;

public record OrderCreatedEvent(
        Long orderId,
        Long customerId,
        String customerEmail,
        BigDecimal totalPrice
) {}
