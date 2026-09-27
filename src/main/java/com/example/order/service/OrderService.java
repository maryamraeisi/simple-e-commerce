package com.example.order.service;

import com.example.cart.entity.CartItem;
import com.example.customer.entity.Customer;
import com.example.customer.service.CustomerService;
import com.example.infrastructure.messaging.constants.RabbitMQExchange;
import com.example.infrastructure.messaging.constants.RabbitMQRoutingKey;
import com.example.infrastructure.security.UserContext;
import com.example.order.event.OrderCreatedEvent;
import com.example.order.mapper.OrderMapper;
import com.example.order.repository.OrderRepository;
import com.example.order.entity.Order;
import com.example.order.entity.OrderItem;
import com.example.order.enums.OrderStatus;
import com.example.product.entity.Product;
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
    private final RabbitTemplate rabbitTemplate;
    private final UserContext userContext;
    private final CustomerService customerService;

    public OrderResponse createOrder() {
        Long customerId = userContext.getCurrentUserId();
        Customer customer = customerService.getCustomerById(customerId);

        List<CartItem> cartItems = customer.getCart().getCartItems();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity();
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);
            OrderItem orderItem = createOrderItem(quantity, product, subtotal);
            orderItems.add(orderItem);
        }

        Order order = createOrder(customer, orderItems, total);
        order = orderRepository.save(order);

        sendOrderCreatedNotification(order, customer);

        return OrderMapper.toResponse(order);
    }

    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id).map(OrderMapper::toResponse).orElseThrow();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow();
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

    public void updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(orderStatus);
        orderRepository.save(order);
    }

        private OrderItem createOrderItem(Integer quantity, Product product, BigDecimal subtotal) {
        return OrderItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .quantity(quantity)
                .unitPrice(product.getPrice())
                .subtotal(subtotal)
                .build();
    }

    private Order createOrder(Customer customer, List<OrderItem> items, BigDecimal total) {
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
                RabbitMQExchange.EXCHANGE,
                RabbitMQRoutingKey.ORDER_CREATED,
                event
        );
    }

}