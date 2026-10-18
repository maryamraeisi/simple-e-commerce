package com.example.customer.controller;

import com.example.customer.service.CustomerService;
import com.example.customer.dto.CustomerResponse;
import com.example.customer.dto.UpdateCustomerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable Long id, @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

}