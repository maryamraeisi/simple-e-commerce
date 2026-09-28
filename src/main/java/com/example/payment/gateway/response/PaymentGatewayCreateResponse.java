package com.example.payment.gateway.response;

public record PaymentGatewayCreateResponse(
        String authority,
        String paymentUrl
) {
}