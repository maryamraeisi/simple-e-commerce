package com.example.order.event;

import java.math.BigDecimal;

public record OrderCreatedEvent(
        Long orderId,
        Long customerId,
        String customerEmail,
        BigDecimal totalPrice
) {}
