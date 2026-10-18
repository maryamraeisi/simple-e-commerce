package com.example.customer.entity;

import com.example.cart.entity.Cart;
import com.example.infrastructure.security.entity.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    @Column(nullable = false, unique = true)
    private String email;
    private String phoneNumber;
    private LocalDateTime createdAt;
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Cart cart;
    @OneToOne(optional = false, fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;
}