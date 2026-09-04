package com.example.infrastructure.messaging.constants;

public final class RabbitMQExchange {

    private RabbitMQExchange() {}

    // Main exchange
    public static final String EXCHANGE = "ecommerce.exchange";

    // Dead Letter Exchange
    public static final String DEAD_LETTER = "ecommerce.dlx";
}
