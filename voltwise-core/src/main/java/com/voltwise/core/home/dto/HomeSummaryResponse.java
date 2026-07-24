package com.voltwise.core.home.dto;

public record HomeSummaryResponse(
        Long homeId,
        String name,
        double budgetLimit,
        double accumulatedCost,
        double budgetUsageRatio,
        boolean penaltyActive,
        boolean quotaBreached,
        boolean hasAnomaly,
        int applianceCount) {
}
