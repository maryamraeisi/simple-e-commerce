package com.example.infrastructure.security.service;

import com.example.cart.service.CartService;
import com.example.customer.dto.CreateCustomerRequest;
import com.example.customer.dto.CustomerResponse;
import com.example.customer.entity.Customer;
import com.example.customer.service.CustomerService;
import com.example.infrastructure.security.dto.LoginRequest;
import com.example.infrastructure.security.dto.AppUserResponse;
import com.example.infrastructure.security.entity.AppUser;
import com.example.infrastructure.security.entity.Role;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UserContext userContext;
    private final CustomerService customerService;
    private final CartService cartService;

    public void login(LoginRequest loginRequest,
                      HttpServletRequest httpRequest,
                      HttpServletResponse httpResponse) {

        setSecurityContext(loginRequest, httpRequest, httpResponse);
        cartService.mergeGuestCart(httpRequest, httpResponse);
    }

    private void setSecurityContext(LoginRequest loginRequest,
                                    HttpServletRequest httpRequest,
                                    HttpServletResponse httpResponse) {

        UsernamePasswordAuthenticationToken unauthenticated = UsernamePasswordAuthenticationToken
                .unauthenticated(loginRequest.username(), loginRequest.password());
        Authentication authentication = authenticationManager.authenticate(unauthenticated);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
    }

    public CustomerResponse signup(CreateCustomerRequest request) {
        return customerService.create(request);
    }

    public AppUserResponse getCurrentUser() {
        AppUser appUser = userContext.getCurrentUser();
        String firstName = null;
        String lastName = null;

        if (appUser.getRoles().contains(Role.CUSTOMER)) {
            Customer customer = customerService.getCustomerByUserId(appUser.getId());
            firstName = customer.getFirstName();
            lastName = customer.getLastName();
        }

        return new AppUserResponse(appUser.getUsername(), appUser.getRoles(), firstName, lastName);
    }
}
