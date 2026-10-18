package com.example.order.controller;

import com.example.order.dto.OrderResponse;
import com.example.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder() {
        return ResponseEntity.ok(orderService.createOrder());
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getCustomerOrder(id));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getCurrentCustomerOrders() {
        return ResponseEntity.ok(orderService.getCurrentCustomerOrders());
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PatchMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
    }
}