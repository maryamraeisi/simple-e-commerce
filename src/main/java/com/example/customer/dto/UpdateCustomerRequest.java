package com.example.customer.dto;

public record UpdateCustomerRequest(
        String firstName,
        String lastName,
        String phoneNumber
) {}