package com.example.notification;

import com.example.infrastructure.messaging.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.queue")
    public void consume(OrderCreatedEvent event) {
        log.info("Received a Message from Notification Queue");
        notificationService.sendOrderCreatedNotification(event.customerId(),
                event.customerEmail(),
                event.orderId());
    }
}