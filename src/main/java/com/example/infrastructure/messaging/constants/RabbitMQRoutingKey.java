package com.example.infrastructure.messaging.constants;

public final class RabbitMQRoutingKey {

    private RabbitMQRoutingKey() {}

    public static final String ORDER_CREATED = "order.created";


    public static final String PAYMENT_CREATED = "payment.created";
    public static final String PAYMENT_COMPLETED = "payment.completed";
    public static final String PAYMENT_FAILED = "payment.failed";
    public static final String PAYMENT_EVENTS = "payment.*";

    public static final String NOTIFICATION_DEAD = "notification.dead";
}
