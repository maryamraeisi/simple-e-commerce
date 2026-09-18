package com.example.customer.service;

import com.example.cart.entity.Cart;
import com.example.customer.dto.CreateCustomerRequest;
import com.example.customer.dto.CustomerResponse;
import com.example.customer.dto.UpdateCustomerRequest;
import com.example.customer.entity.Customer;
import com.example.customer.mapper.CustomerMapper;
import com.example.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository repository;
    private final PasswordEncoder passwordEncoder;

    public CustomerResponse create(CreateCustomerRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists.");
        }

        Cart cart = new Cart();

        Customer customer = Customer.builder()
                        .firstName(request.firstName())
                        .lastName(request.lastName())
                        .email(request.email())
                        .password(passwordEncoder.encode(request.password()))
                        .phoneNumber(request.phoneNumber())
                        .cart(cart)
                        .createdAt(LocalDateTime.now())
                        .build();

        cart.setCustomer(customer);

        customer = repository.save(customer);

        return CustomerMapper.toResponse(customer);
    }

    public CustomerResponse getById(Long id) {
        Customer customer = repository.findById(id).orElseThrow();

        return CustomerMapper.toResponse(customer);
    }

    public List<CustomerResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(CustomerMapper::toResponse)
                .toList();
    }

    public CustomerResponse update(Long id, UpdateCustomerRequest request) {
        Customer customer = repository.findById(id).orElseThrow();

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setPhoneNumber(request.phoneNumber());

        customer = repository.save(customer);

        return CustomerMapper.toResponse(customer);
    }

    public void delete(Long id) {
        Customer customer = repository.findById(id).orElseThrow();

        repository.delete(customer);
    }
}