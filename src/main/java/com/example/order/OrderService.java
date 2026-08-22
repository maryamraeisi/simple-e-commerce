package com.example.order;

import com.example.customer.Customer;
import com.example.customer.CustomerRepository;
import com.example.order.dto.*;
import com.example.order.exception.OrderNotFoundException;
import com.example.product.Product;
import com.example.product.ProductRepository;
import com.example.order.dto.CreateOrderRequest;
import com.example.order.dto.OrderItemRequest;
import com.example.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
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
    public OrderResponse createOrder(CreateOrderRequest request) {

        Customer customer = customerRepository.findById(request.customerId()).orElseThrow();

        List<OrderItem> items = new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest requestItem : request.items()) {

            Product product = productRepository.findById(requestItem.productId()).orElseThrow();

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(requestItem.quantity()));

            total = total.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(requestItem.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            items.add(orderItem);
        }

        Order order = Order.builder()
                        .customer(customer)
                        .items(items)
                        .status(OrderStatus.CREATED)
                        .totalPrice(total)
                        .createdAt(LocalDateTime.now())
                        .build();

        order = orderRepository.save(order);

        return OrderMapper.toResponse(order);
    }

    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id).map(OrderMapper::toResponse)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository
                .findAll()
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        order.setStatus(OrderStatus.CANCELLED);

        orderRepository.save(order);
    }
}