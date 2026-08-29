package com.example.notification.service;

import com.example.notification.repository.NotificationRepository;
import com.example.notification.entity.Notification;
import com.example.notification.enums.NotificationStatus;
import com.example.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    private final EmailService emailService;

    public void sendOrderCreatedNotification(Long customerId, String email, Long orderId) {
        String subject = "Order Created";

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