package com.example.infrastructure.messaging.constants;

public final class RabbitMQQueue {

    private RabbitMQQueue() {}

    public static final String NOTIFICATION_QUEUE = "notification.queue";

    public static final String INVENTORY_RESERVE = "inventory.reserve";
    public static final String INVENTORY_RELEASE = "inventory.release";
    public static final String INVENTORY_CONFIRM = "inventory.confirm";


    public static final String NOTIFICATION_DLQ = "notification.dlq";

    public static final String INVENTORY_DLQ = "inventory.dlq";
}
