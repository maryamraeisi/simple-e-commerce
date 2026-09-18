package com.example.infrastructure.security.dto;

public record LoginRequest(
        String email,
        String password
) {
}
