package com.example.payment.dto;

import java.math.BigDecimal;

public record CreatePaymentRequest(
        Long orderId,
        BigDecimal amount
) {
}
