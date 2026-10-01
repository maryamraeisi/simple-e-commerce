package com.example.payment.service;

import com.example.cart.service.CartService;
import com.example.infrastructure.messaging.constants.RabbitMQExchange;
import com.example.infrastructure.messaging.constants.RabbitMQRoutingKey;
import com.example.order.entity.Order;
import com.example.order.enums.OrderStatus;
import com.example.order.service.OrderService;
import com.example.payment.dto.CreatePaymentRequest;
import com.example.payment.dto.PaymentResponse;
import com.example.payment.entity.Payment;
import com.example.payment.entity.PaymentTransaction;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.enums.PaymentProvider;
import com.example.payment.enums.PaymentTransactionStatus;
import com.example.payment.event.PaymentCompletedEvent;
import com.example.payment.event.PaymentCreatedEvent;
import com.example.payment.event.PaymentFailedEvent;
import com.example.payment.gateway.PaymentGatewayFactory;
import com.example.payment.gateway.PaymentGateway;
import com.example.payment.gateway.mock.MockPaymentResult;
import com.example.payment.gateway.request.PaymentGatewayCreateRequest;
import com.example.payment.gateway.request.PaymentGatewayVerifyRequest;
import com.example.payment.gateway.response.PaymentGatewayCreateResponse;
import com.example.payment.gateway.response.PaymentGatewayVerifyResponse;
import com.example.payment.mapper.PaymentMapper;
import com.example.payment.repository.PaymentRepository;
import com.example.payment.repository.PaymentTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RabbitTemplate rabbitTemplate;
    private final OrderService orderService;
    private final CartService cartService;
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final PaymentProvider provider = PaymentProvider.MOCK;
    private final String CALLBACK_URL = "/api/payments/callback";

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Order order = orderService.getOrderById(request.orderId());

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can not be paid.");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> createNewPayment(order));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Order has already been paid.");
        }

        PaymentTransaction transaction = createNewTransaction(payment, provider);
        payment.getTransactions().add(transaction);

        PaymentGatewayCreateRequest paymentGatewayCreateRequest =
                new PaymentGatewayCreateRequest(payment.getAmount(), CALLBACK_URL);
        PaymentGateway gateway = paymentGatewayFactory.getGateway(provider);
        PaymentGatewayCreateResponse gatewayResponse = gateway.createPayment(paymentGatewayCreateRequest);

        transaction.setAuthority(gatewayResponse.authority());
        transaction.setStatus(PaymentTransactionStatus.REDIRECTED);
        transaction.setUpdatedAt(LocalDateTime.now());

        payment.setStatus(PaymentStatus.PENDING);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        sendPaymentCreatedEvent(payment);

        return PaymentMapper.toResponse(payment, gatewayResponse.paymentUrl());
    }

    @Transactional
    public PaymentResponse handleCallback(String authority, MockPaymentResult status) {
        PaymentTransaction transaction = paymentTransactionRepository.findByAuthority(authority)
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found."));

        Payment payment = transaction.getPayment();
        if (transaction.getStatus() == PaymentTransactionStatus.SUCCESS) {
            return PaymentMapper.toResponse(payment);
        }

        if (MockPaymentResult.CANCELLED.equals(status)) {
            PaymentResponse paymentResponse = updateFailPayment(transaction, payment);
            sendPaymentFailedEvent(payment);
            return paymentResponse;
        }

        if (MockPaymentResult.SUCCESS.equals(status)) {
            PaymentGatewayVerifyResponse verification = verifyPayment(transaction, payment);

            if (!verification.successful()) {
                PaymentResponse paymentResponse = updateFailPayment(transaction, payment);
                sendPaymentFailedEvent(payment);
                return paymentResponse;
            }

            PaymentResponse paymentResponse = updateSuccessPayment(transaction, verification, payment);
            sendPaymentCompletedEvent(payment);
            return paymentResponse;
        }

        throw new IllegalArgumentException("Unknown result status.");
    }

    private PaymentGatewayVerifyResponse verifyPayment(PaymentTransaction transaction, Payment payment) {
        PaymentGateway gateway = paymentGatewayFactory.getGateway(transaction.getProvider());

        PaymentGatewayVerifyRequest paymentGatewayVerifyRequest =
                new PaymentGatewayVerifyRequest(payment.getAmount(), transaction.getAuthority());
        PaymentGatewayVerifyResponse verification = gateway.verifyPayment(paymentGatewayVerifyRequest);
        return verification;
    }

    private PaymentResponse updateSuccessPayment(PaymentTransaction transaction,
                                                 PaymentGatewayVerifyResponse verification,
                                                 Payment payment) {
        transaction.setStatus(PaymentTransactionStatus.SUCCESS);
        transaction.setReferenceId(verification.referenceId());
        transaction.setUpdatedAt(LocalDateTime.now());

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setUpdatedAt(LocalDateTime.now());

        Order order = orderService.getOrderById(payment.getOrderId());
        orderService.updateOrderStatus(order.getId(), OrderStatus.PAID);

        cartService.deleteAllItemsForCustomer(order.getCustomer().getId());

        paymentTransactionRepository.save(transaction);
        paymentRepository.save(payment);

        return PaymentMapper.toResponse(payment);
    }

    private PaymentResponse updateFailPayment(PaymentTransaction transaction, Payment payment) {
        transaction.setStatus(PaymentTransactionStatus.FAILED);
        transaction.setUpdatedAt(LocalDateTime.now());

        payment.setStatus(PaymentStatus.FAILED);
        payment.setUpdatedAt(LocalDateTime.now());

        paymentTransactionRepository.save(transaction);
        paymentRepository.save(payment);

        return PaymentMapper.toResponse(payment);
    }

    public List<PaymentResponse> getAll() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream().map(PaymentMapper::toResponse).toList();
    }

    public PaymentResponse getById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        return PaymentMapper.toResponse(payment);
    }

    private Payment createNewPayment(Order order) {
        Payment payment = Payment.builder()
                .orderId(order.getId())
                .amount(order.getTotalPrice())
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    private PaymentTransaction createNewTransaction(Payment payment, PaymentProvider provider) {
        return PaymentTransaction.builder()
                .payment(payment)
                .provider(provider)
                .status(PaymentTransactionStatus.INITIATED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private void sendPaymentFailedEvent(Payment payment) {
        PaymentFailedEvent event = new PaymentFailedEvent(payment.getId(),
                payment.getOrderId(),
                payment.getAmount());

        rabbitTemplate.convertAndSend(RabbitMQExchange.EXCHANGE, RabbitMQRoutingKey.PAYMENT_FAILED, event);
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
