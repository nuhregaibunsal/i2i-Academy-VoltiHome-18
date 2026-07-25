package com.voltwise.core.home.dto;

import java.time.Instant;

public record RecommendationResponse(
        Long id,
        String triggerReason,
        String content,
        boolean delivered,
        Instant createdAt) {
}
