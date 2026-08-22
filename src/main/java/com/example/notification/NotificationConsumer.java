package com.example.notification;

import com.example.infrastructure.messaging.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.queue")
    public void consume(OrderCreatedEvent event) {
        notificationService.sendOrderConfirmation(event.customerId(), event.customerEmail(), event.orderId());
    }
}