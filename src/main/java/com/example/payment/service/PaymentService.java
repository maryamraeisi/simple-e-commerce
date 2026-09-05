package com.example.payment.service;

import com.example.infrastructure.messaging.constants.RabbitMQExchange;
import com.example.infrastructure.messaging.constants.RabbitMQRoutingKey;
import com.example.order.enums.OrderStatus;
import com.example.order.service.OrderService;
import com.example.payment.dto.CreatePaymentRequest;
import com.example.payment.dto.PaymentResponse;
import com.example.payment.entity.Payment;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.event.PaymentCompletedEvent;
import com.example.payment.event.PaymentCreatedEvent;
import com.example.payment.mapper.PaymentMapper;
import com.example.payment.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    private final OrderService orderService;

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Payment payment = Payment.builder()
                .orderId(request.orderId())
                .amount(request.amount())
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        sendPaymentCreatedEvent(payment);

        return PaymentMapper.toResponse(saved);
    }

    public PaymentResponse completePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setUpdatedAt(LocalDateTime.now());

        Payment updated = paymentRepository.save(payment);

        orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.PAID);

        sendPaymentCompletedEvent(payment);

        return PaymentMapper.toResponse(updated);
    }

    private void sendPaymentCompletedEvent(Payment payment) {
        PaymentCompletedEvent event = new PaymentCompletedEvent(payment.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQExchange.EXCHANGE, RabbitMQRoutingKey.PAYMENT_COMPLETED, event);
    }

    private void sendPaymentCreatedEvent(Payment payment) {
        PaymentCreatedEvent event = new PaymentCreatedEvent(payment.getId(),
                payment.getOrderId(),
                payment.getAmount());

        rabbitTemplate.convertAndSend(RabbitMQExchange.EXCHANGE, RabbitMQRoutingKey.PAYMENT_CREATED, event);
    }

}
