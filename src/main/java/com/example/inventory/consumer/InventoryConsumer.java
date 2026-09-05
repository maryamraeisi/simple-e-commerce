package com.example.inventory.consumer;

import com.example.infrastructure.messaging.constants.RabbitMQQueue;
import com.example.inventory.service.InventoryService;
import com.example.payment.event.PaymentCompletedEvent;
import com.example.payment.event.PaymentCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryConsumer {

    private final InventoryService inventoryService;

    @RabbitListener(queues = RabbitMQQueue.INVENTORY_RESERVE)
    public void consume(PaymentCreatedEvent event) {
        log.info("Reserving products of the order with order id: {}", event.orderId());
        inventoryService.reserveStock(event.orderId());
    }

    @RabbitListener(queues = RabbitMQQueue.INVENTORY_CONFIRM)
    public void consume(PaymentCompletedEvent event) {
        log.info("Confirming products of the order with order id: {}", event.orderId());
        inventoryService.purchaseConfirmed(event.orderId());
    }

}
