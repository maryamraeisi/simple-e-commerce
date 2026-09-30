package com.example.payment.gateway.mock;

import com.example.payment.gateway.request.PaymentGatewayCreateRequest;
import com.example.payment.gateway.request.PaymentGatewayVerifyRequest;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;
import com.example.payment.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockPaymentGateway implements PaymentGateway {

    private final String PAYMENT_URL = "/payment/storefront/mock-ipg/payment.html";
    private final Map<String, MockPaymentSession> payments = new ConcurrentHashMap<>();

    @Override
    public PaymentGatewayCreateResponse createPayment(PaymentGatewayCreateRequest request) {
        if (request.amount() == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }

        String authority = UUID.randomUUID().toString();
        MockPaymentSession mockPaymentSession = createMockPaymentSession(request);
        payments.put(authority, mockPaymentSession);
        String paymentUrl = PAYMENT_URL + "?authority=" + authority;
        return new PaymentGatewayCreateResponse(authority, paymentUrl);
    }

    @Override
    public PaymentGatewayVerifyResponse verifyPayment(PaymentGatewayVerifyRequest request) {
        MockPaymentSession session = payments.get(request.authority());

        if (session == null) {
            return new PaymentGatewayVerifyResponse(false, null);
        }

        if (session.amount() == null ||
                session.amount().compareTo(request.amount()) != 0) {
            return new PaymentGatewayVerifyResponse(false, null);
        }

        String referenceId = "REF-" + UUID.randomUUID();
        payments.remove(request.authority());
        return new PaymentGatewayVerifyResponse(true, referenceId);
    }

    public BigDecimal getPaymentAmount(String authority) {
        MockPaymentSession session = payments.get(authority);

        if (session == null) {
            throw new IllegalArgumentException("Payment not found.");
        }

        return session.amount();
    }

    public MockPaymentResponse processMockPayment(MockPaymentRequest request) {
        String authority = request.authority();
        MockPaymentResult result = request.result();

        MockPaymentSession session = payments.get(authority);

        if (session == null) {
            throw new IllegalArgumentException("Payment not found.");
        }

        String callbackUrl = session.callbackUrl()
                + "?authority=" + authority
                + "&status=" + result;

        return new MockPaymentResponse(callbackUrl);
    }

    private MockPaymentSession createMockPaymentSession(PaymentGatewayCreateRequest request) {
        return new MockPaymentSession(request.amount(), request.callbackUrl());
    }
}
