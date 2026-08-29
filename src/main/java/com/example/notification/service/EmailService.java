package com.example.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    public void sendEmail(String recipient, String subject, String message) {
        log.info("Sending email...");
        log.info("To: {}", recipient);
        log.info("Subject: {}", subject);
        log.info("Message: {}", message);

        // Later replace this with JavaMailSender or another email provider.
    }
}