package com.example.infrastructure.messaging.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Main exchange
    public static final String EXCHANGE = "ecommerce.exchange";

    // Routing keys
    public static final String ORDER_CREATED = "order.created";

    // Notification queue
    public static final String NOTIFICATION_QUEUE = "notification.queue";

    // Dead Letter Exchange
    public static final String DLX = "notification.dlx";

    // Dead Letter Queue
    public static final String DLQ = "notification.dlq";


    // =========================
    // Main Exchange
    // =========================

    @Bean
    public DirectExchange ecommerceExchange() {
        return new DirectExchange(EXCHANGE);
    }


    // =========================
    // Notification Queue
    // =========================

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder
                .durable(NOTIFICATION_QUEUE)
                .deadLetterExchange(DLX)
                .build();
    }


    // =========================
    // Notification Binding
    // =========================

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange ecommerceExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(ecommerceExchange)
                .with(ORDER_CREATED);
    }


    // =========================
    // Dead Letter Exchange
    // =========================

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX);
    }


    // =========================
    // Dead Letter Queue
    // =========================

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }


    // =========================
    // DLQ Binding
    // =========================

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder
                .bind(deadLetterQueue)
                .to(deadLetterExchange)
                .with(NOTIFICATION_QUEUE);
    }


    // =========================
    // JSON Message Converter
    // =========================

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }


    // =========================
    // RabbitTemplate
    // =========================

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter converter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        return rabbitTemplate;
    }


    // =========================
    // Listener Factory
    // =========================

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory,
                                                                               Jackson2JsonMessageConverter converter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        return factory;
    }
}