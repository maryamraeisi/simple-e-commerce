package com.example.payment.gateway;

import com.example.payment.entity.Payment;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;

public interface PaymentGateway {

    PaymentGatewayCreateResponse createPayment(Payment payment, PaymentTransaction transaction);

    PaymentGatewayVerifyResponse verifyPayment(Payment payment, PaymentTransaction transaction);
}