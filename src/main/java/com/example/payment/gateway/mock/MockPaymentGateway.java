package com.example.payment.gateway.mock;

import com.example.payment.entity.Payment;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;
import com.example.payment.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentGatewayCreateResponse createPayment(Payment payment, PaymentTransaction transaction) {
        String authority = UUID.randomUUID().toString();
        String paymentUrl = "/payment/storefront/mock-ipg/payment.html?authority=" + authority;
        return new PaymentGatewayCreateResponse(authority, paymentUrl);
    }

    @Override
    public PaymentGatewayVerifyResponse verifyPayment(Payment payment, PaymentTransaction transaction) {
        String referenceId = "REF-" + UUID.randomUUID();
        return new PaymentGatewayVerifyResponse(true, referenceId);
    }
}
