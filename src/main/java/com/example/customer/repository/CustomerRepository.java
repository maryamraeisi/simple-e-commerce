package com.example.customer.repository;

import com.example.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByUserId(Long userId);

    boolean existsByEmail(String email);
}