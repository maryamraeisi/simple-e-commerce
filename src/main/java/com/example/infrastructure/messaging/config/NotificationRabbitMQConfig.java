package com.example.infrastructure.messaging.config;

import com.example.infrastructure.messaging.constants.RabbitMQExchange;
import com.example.infrastructure.messaging.constants.RabbitMQQueue;
import com.example.infrastructure.messaging.constants.RabbitMQRoutingKey;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationRabbitMQConfig {

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder
                .durable(RabbitMQQueue.NOTIFICATION_QUEUE)
                .deadLetterExchange(RabbitMQExchange.DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange ecommerceExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(ecommerceExchange)
                .with(RabbitMQRoutingKey.ORDER_CREATED);
    }

    @Bean
    public Queue notificationDeadLetterQueue() {
        return QueueBuilder.durable(RabbitMQQueue.NOTIFICATION_DLQ).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue notificationDeadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder
                .bind(notificationDeadLetterQueue)
                .to(deadLetterExchange)
                .with(RabbitMQRoutingKey.NOTIFICATION_DEAD);
    }
}
