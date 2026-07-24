package com.voltwise.core.home.dto;

import java.util.List;

public record HomeStatusResponse(
        Long homeId,
        String name,
        String contactEmail,
        double budgetLimit,
        double accumulatedCost,
        double accumulatedEnergyWh,
        double budgetUsageRatio,
        boolean penaltyActive,
        boolean warnedAt80,
        boolean breachedAt100,
        boolean quotaBreached,
        boolean hasAnomaly,
        List<ApplianceStatusResponse> appliances) {
}
