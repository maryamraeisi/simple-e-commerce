package com.example.payment.gateway;

import com.example.payment.gateway.request.PaymentGatewayCreateRequest;
import com.example.payment.gateway.request.PaymentGatewayVerifyRequest;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;

public interface PaymentGateway {

    PaymentGatewayCreateResponse createPayment(PaymentGatewayCreateRequest request);

    PaymentGatewayVerifyResponse verifyPayment(PaymentGatewayVerifyRequest request);
}