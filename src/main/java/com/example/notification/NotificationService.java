package com.example.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    private final EmailService emailService;

    public void sendOrderConfirmation(Long customerId, String email, Long orderId) {
        String subject = "Order Confirmation";

        String message = "Thank you for your order #" + orderId;

        emailService.sendEmail(email, subject, message);

        Notification notification = Notification.builder()
                .customerId(customerId)
                .recipient(email)
                .subject(subject)
                .message(message)
                .type(NotificationType.EMAIL)
                .status(NotificationStatus.SENT)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(notification);
    }
}