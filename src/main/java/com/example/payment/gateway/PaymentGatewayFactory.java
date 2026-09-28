package com.example.payment.gateway;

import com.example.payment.enums.PaymentProvider;
import com.example.payment.gateway.mock.MockPaymentGateway;
import com.example.payment.gateway.paypal.PaypalPaymentGateway;
import com.example.payment.gateway.zarinpal.ZarinPalPaymentGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentGatewayFactory {

    private final MockPaymentGateway mockPaymentGateway;
    private final ZarinPalPaymentGateway zarinPalPaymentGateway;
    private final PaypalPaymentGateway payPalPaymentGateway;

    public PaymentGateway getGateway(PaymentProvider provider) {
        return switch (provider) {
            case MOCK -> mockPaymentGateway;
            case ZARINPAL -> zarinPalPaymentGateway;
            case PAYPAL -> payPalPaymentGateway;
        };
    }
}
