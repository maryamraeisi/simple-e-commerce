package com.example.infrastructure.messaging.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "ecommerce.exchange";
    public static final String ORDER_CREATED = "order.created";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String DLX = "notification.dlx";
    public static final String DLQ = "notification.dlq";
}
