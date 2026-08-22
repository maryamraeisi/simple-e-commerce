package com.example.customer.dto;

public record CreateCustomerRequest(
        String firstName,
        String lastName,
        String email,
        String phoneNumber
) {}