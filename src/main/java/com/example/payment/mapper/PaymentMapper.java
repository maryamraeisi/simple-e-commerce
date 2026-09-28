package com.example.payment.mapper;

import com.example.payment.dto.PaymentResponse;
import com.example.payment.entity.Payment;

public class PaymentMapper {

    private PaymentMapper() {}

    public static PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getStatus(),
                null
        );
    }

    public static PaymentResponse toResponse(Payment payment, String paymentUrl) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getStatus(),
                paymentUrl
        );
    }
}
