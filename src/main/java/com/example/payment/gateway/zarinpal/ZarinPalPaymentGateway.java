package com.example.payment.gateway.zarinpal;

import com.example.payment.entity.Payment;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.gateway.request.PaymentGatewayCreateRequest;
import com.example.payment.gateway.request.PaymentGatewayVerifyRequest;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;
import com.example.payment.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

@Component
public class ZarinPalPaymentGateway implements PaymentGateway {

    @Override
    public PaymentGatewayCreateResponse createPayment(PaymentGatewayCreateRequest request) {
        return null;
    }

    @Override
    public PaymentGatewayVerifyResponse verifyPayment(PaymentGatewayVerifyRequest request) {
        return null;
    }
}
