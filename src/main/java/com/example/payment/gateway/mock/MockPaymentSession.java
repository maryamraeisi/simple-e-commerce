package com.example.payment.gateway.mock;

import java.math.BigDecimal;

public record MockPaymentSession(
        BigDecimal amount,
        String callbackUrl
) {
}
