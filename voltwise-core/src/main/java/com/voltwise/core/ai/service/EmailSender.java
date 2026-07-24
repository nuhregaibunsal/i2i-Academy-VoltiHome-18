package com.voltwise.core.ai.service;

import com.voltwise.core.common.config.VoltWiseProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmailSender {

    private final JavaMailSender mailSender;
    private final VoltWiseProperties.Mail config;

    public EmailSender(JavaMailSender mailSender, VoltWiseProperties properties) {
        this.mailSender = mailSender;
        this.config = properties.getMail();
    }

    public boolean send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(config.getFrom());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Advisory email dispatched to {}", to);
            return true;
        } catch (Exception ex) {
            log.error("Failed to dispatch advisory email to {}: {}", to, ex.getMessage());
            return false;
        }
    }
}
