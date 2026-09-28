package com.example.payment.entity;

import com.example.payment.enums.PaymentProvider;
import com.example.payment.enums.PaymentTransactionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    @Enumerated(EnumType.STRING)
    private PaymentProvider provider;
    private String authority;
    private String referenceId;
    @Enumerated(EnumType.STRING)
    private PaymentTransactionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}