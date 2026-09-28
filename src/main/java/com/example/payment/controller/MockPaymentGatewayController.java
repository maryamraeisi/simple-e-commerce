package com.example.payment.controller;

import com.example.payment.gateway.mock.MockPaymentRequest;
import com.example.payment.gateway.mock.MockPaymentResponse;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mock-ipg")
@RequiredArgsConstructor
public class MockPaymentGatewayController {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @PostMapping("/process")
    public ResponseEntity<MockPaymentResponse> processPayment(@RequestBody MockPaymentRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository.findByAuthority(request.authority())
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found."));

        if (!"success".equals(request.result()) && !"cancelled".equals(request.result())) {
            throw new IllegalArgumentException("Invalid payment result.");
        }

        String callbackUrl = "/api/payments/callback"
                + "?authority=" + transaction.getAuthority()
                + "&status=" + request.result();

        return ResponseEntity.ok(new MockPaymentResponse(callbackUrl));
    }
}
