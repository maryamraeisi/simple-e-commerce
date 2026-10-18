package com.example.infrastructure.security.controller;

import com.example.customer.dto.CreateCustomerRequest;
import com.example.customer.dto.CustomerResponse;
import com.example.infrastructure.security.dto.AppUserResponse;
import com.example.infrastructure.security.dto.LoginRequest;
import com.example.infrastructure.security.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest,
                                      HttpServletResponse httpResponse) {
        authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<CustomerResponse> signup(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AppUserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

}
