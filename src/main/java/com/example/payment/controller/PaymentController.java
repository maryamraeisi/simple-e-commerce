package com.example.payment.controller;

import com.example.payment.dto.CreatePaymentRequest;
import com.example.payment.dto.PaymentResponse;
import com.example.payment.gateway.mock.MockPaymentResult;
import com.example.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final String ORDER_DETAILS_URL = "/orders/storefront/order-details.html";
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @GetMapping("/callback")
    public void callback(@RequestParam String authority, @RequestParam MockPaymentResult status,
            HttpServletResponse response) throws IOException {
        PaymentResponse payment = paymentService.handleCallback(authority, status);
        String redirectUrl = ORDER_DETAILS_URL + "?id=" + payment.orderId();
        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }
}
