package com.voltwise.core.home.dto;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        Long homeId,
        String homeName,
        String type,
        String message,
        boolean read,
        Instant createdAt) {
}
