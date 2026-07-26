package com.voltwise.core.home.dto;

public record AnomalousApplianceInfo(
        Long applianceId,
        String name,
        double lastWatt,
        double safeLimitWatt,
        int overagePercent) {
}
