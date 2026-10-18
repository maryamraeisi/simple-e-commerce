package com.example.customer.controller;

import com.example.customer.dto.CustomerResponse;
import com.example.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerService customerService;

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public void activation(@PathVariable Long id, Boolean activated) {
        customerService.activation(id, activated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAll() {
        return ResponseEntity.ok(customerService.getAll());
    }

}
