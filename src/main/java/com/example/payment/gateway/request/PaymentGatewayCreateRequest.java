package com.example.payment.gateway.request;

import java.math.BigDecimal;

public record PaymentGatewayCreateRequest(
        BigDecimal amount,
        String callbackUrl
) {
}
