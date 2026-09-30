package com.example.payment.gateway.mock;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/mock-ipg")
@RequiredArgsConstructor
public class MockPaymentGatewayController {

    private final MockPaymentGateway mockPaymentGateway;

    @PostMapping("/process")
    public ResponseEntity<MockPaymentResponse> processPayment(@RequestBody MockPaymentRequest request) {
        return ResponseEntity.ok(mockPaymentGateway.processMockPayment(request));
    }

    @GetMapping("/payment/{authority}")
    public ResponseEntity<BigDecimal> getPayment(@PathVariable String authority) {
        return ResponseEntity.ok(mockPaymentGateway.getPaymentAmount(authority));
    }
}
