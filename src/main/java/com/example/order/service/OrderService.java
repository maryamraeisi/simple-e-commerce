package com.example.order.service;

import com.example.customer.entity.Customer;
import com.example.customer.repository.CustomerRepository;
import com.example.infrastructure.messaging.config.RabbitMQConfig;
import com.example.order.event.OrderCreatedEvent;
import com.example.order.mapper.OrderMapper;
import com.example.order.repository.OrderRepository;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.enums.OrderStatus;
import com.example.product.entity.Product;
import com.example.product.repository.ProductRepository;
import com.example.order.dto.CreateOrderRequest;
import com.example.order.dto.OrderItemRequest;
import com.example.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    private final CustomerRepository customerRepository;

    private final ProductRepository productRepository;

    private final RabbitTemplate rabbitTemplate;

    public OrderResponse createOrder(CreateOrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = getOrderItems(request, total);
        Order order = prepareOrder(customer, items, total);
        order = orderRepository.save(order);

        sendOrderCreatedNotification(order, customer);

        return OrderMapper.toResponse(order);
    }

    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id).map(OrderMapper::toResponse).orElseThrow();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository
                .findAll()
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();

        order.setStatus(OrderStatus.CANCELLED);

        orderRepository.save(order);
    }

    private List<OrderItem> getOrderItems(CreateOrderRequest request, BigDecimal total) {
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest requestItem : request.items()) {
            Product product = productRepository.findById(requestItem.productId()).orElseThrow();

            Integer quantity = requestItem.quantity();
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            OrderItem orderItem = prepareOrderItem(quantity, product, subtotal);
            items.add(orderItem);
        }

        return items;
    }

        private OrderItem prepareOrderItem(Integer quantity, Product product, BigDecimal subtotal) {
        return OrderItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantity(quantity)
                .unitPrice(product.getPrice())
                .subtotal(subtotal)
                .build();
    }

    private Order prepareOrder(Customer customer, List<OrderItem> items, BigDecimal total) {
        return Order.builder()
                .customer(customer)
                .items(items)
                .status(OrderStatus.CREATED)
                .totalPrice(total)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void sendOrderCreatedNotification(Order order, Customer customer) {
        OrderCreatedEvent event = new OrderCreatedEvent(order.getId(), customer.getId(),
                customer.getEmail(), order.getTotalPrice());

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ORDER_CREATED,
                event
        );
    }
}