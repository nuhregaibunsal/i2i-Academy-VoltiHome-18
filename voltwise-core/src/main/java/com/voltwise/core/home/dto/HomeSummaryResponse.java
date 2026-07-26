package com.voltwise.core.home.dto;

import java.util.List;

public record HomeSummaryResponse(
        Long homeId,
        String name,
        double budgetLimit,
        double accumulatedCost,
        double budgetUsageRatio,
        boolean penaltyActive,
        boolean quotaBreached,
        boolean hasAnomaly,
        List<AnomalousApplianceInfo> anomalousAppliances,
        int applianceCount) {
}
