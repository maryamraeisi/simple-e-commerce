package com.example.payment.gateway.response;

public record PaymentGatewayVerifyResponse(
        boolean successful,
        String referenceId
) {
}