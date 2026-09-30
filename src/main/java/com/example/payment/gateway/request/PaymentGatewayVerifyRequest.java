package com.example.payment.gateway.request;

import java.math.BigDecimal;

public record PaymentGatewayVerifyRequest(
        BigDecimal amount,
        String authority
) {
}
