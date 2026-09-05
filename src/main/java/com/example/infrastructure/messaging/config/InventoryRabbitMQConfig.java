package com.example.infrastructure.messaging.config;

import com.example.infrastructure.messaging.constants.RabbitMQExchange;
import com.example.infrastructure.messaging.constants.RabbitMQQueue;
import com.example.infrastructure.messaging.constants.RabbitMQRoutingKey;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.*;

@Configuration
public class InventoryRabbitMQConfig {

    @Bean
    public Queue inventoryReserveQueue() {
        return QueueBuilder
                .durable(RabbitMQQueue.INVENTORY_RESERVE)
                .deadLetterExchange(RabbitMQExchange.DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding inventoryReserveBinding(Queue inventoryReserveQueue, TopicExchange ecommerceExchange) {
        return BindingBuilder
                .bind(inventoryReserveQueue)
                .to(ecommerceExchange)
                .with(RabbitMQRoutingKey.PAYMENT_CREATED);
    }

    @Bean
    public Queue inventoryReleaseQueue() {
        return QueueBuilder
                .durable(RabbitMQQueue.INVENTORY_RELEASE)
                .deadLetterExchange(RabbitMQExchange.DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding inventoryReleaseBinding(Queue inventoryReleaseQueue, TopicExchange ecommerceExchange) {
        return BindingBuilder
                .bind(inventoryReleaseQueue)
                .to(ecommerceExchange)
                .with(RabbitMQRoutingKey.PAYMENT_FAILED);
    }

    @Bean
    public Queue inventoryConfirmQueue() {
        return QueueBuilder
                .durable(RabbitMQQueue.INVENTORY_CONFIRM)
                .deadLetterExchange(RabbitMQExchange.DEAD_LETTER)
                .build();
    }

    @Bean
    public Binding inventoryConfirmBinding(Queue inventoryConfirmQueue, TopicExchange ecommerceExchange) {
        return BindingBuilder
                .bind(inventoryConfirmQueue)
                .to(ecommerceExchange)
                .with(RabbitMQRoutingKey.PAYMENT_COMPLETED);
    }
}