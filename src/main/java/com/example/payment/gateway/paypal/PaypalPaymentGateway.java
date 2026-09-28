package com.example.payment.gateway.paypal;

import com.example.payment.entity.Payment;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;
import com.example.payment.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

@Component
public class PaypalPaymentGateway implements PaymentGateway {
    @Override
    public PaymentGatewayCreateResponse createPayment(Payment payment, PaymentTransaction transaction) {
        return null;
    }

    @Override
    public PaymentGatewayVerifyResponse verifyPayment(Payment payment, PaymentTransaction transaction) {
        return null;
    }
}
