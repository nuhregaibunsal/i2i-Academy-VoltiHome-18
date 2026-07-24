package com.voltwise.core.home.dto;

import java.util.List;

public record HomeRegisteredResponse(
        Long homeId,
        String name,
        String contactEmail,
        double budgetLimit,
        double baseRatePerKwh,
        List<RegisteredAppliance> appliances) {

    public record RegisteredAppliance(Long applianceId, String name, double safeLimitWatt, double nominalWatt) {
    }
}
