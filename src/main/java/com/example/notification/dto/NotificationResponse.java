package com.example.notification.dto;

import com.example.notification.enums.NotificationStatus;
import com.example.notification.enums.NotificationType;

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