package com.example.payment.gateway.mock;

public record MockPaymentRequest(
        String authority,
        MockPaymentResult result
) {
}
