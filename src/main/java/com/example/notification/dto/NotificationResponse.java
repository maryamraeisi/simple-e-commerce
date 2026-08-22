package com.example.notification.dto;

import com.example.notification.NotificationStatus;
import com.example.notification.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long customerId,
        String recipient,
        String subject,
        String message,
        NotificationType type,
        NotificationStatus status,
        LocalDateTime createdAt
) {}