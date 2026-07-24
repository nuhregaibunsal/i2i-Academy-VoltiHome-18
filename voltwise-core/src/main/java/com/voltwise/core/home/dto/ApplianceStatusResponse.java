package com.voltwise.core.home.dto;

public record ApplianceStatusResponse(
        Long applianceId,
        String name,
        double safeLimitWatt,
        double lastWatt,
        double cumulativeWh,
        int consecutiveBreaches,
        boolean anomalous) {
}
