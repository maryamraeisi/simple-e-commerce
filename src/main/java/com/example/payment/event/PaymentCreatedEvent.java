package com.example.payment.event;

import java.math.BigDecimal;

public record PaymentCreatedEvent(
        Long paymentId,
        Long orderId,
        BigDecimal amount
) {
}
