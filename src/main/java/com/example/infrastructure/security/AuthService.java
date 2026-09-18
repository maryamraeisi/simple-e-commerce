package com.example.infrastructure.security;

import com.example.customer.dto.CreateCustomerRequest;
import com.example.customer.dto.CustomerResponse;
import com.example.customer.entity.Customer;
import com.example.customer.mapper.CustomerMapper;
import com.example.customer.service.CustomerService;
import com.example.infrastructure.security.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UserContext userContext;
    private final CustomerService customerService;

    public void login(LoginRequest loginRequest, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        UsernamePasswordAuthenticationToken unauthenticated = UsernamePasswordAuthenticationToken
                .unauthenticated(loginRequest.email(), loginRequest.password());

        Authentication authentication = authenticationManager.authenticate(unauthenticated);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
    }

    public CustomerResponse signup(CreateCustomerRequest request) {
        return customerService.create(request);
    }

    public CustomerResponse getCurrentUser() {
        Customer currentUser = userContext.getCurrentUser();
        return CustomerMapper.toResponse(currentUser);
    }
}
