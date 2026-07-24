package com.voltwise.core.home.messaging;

import java.util.List;

public record RegistrationEvent(
        Long homeId,
        String name,
        String contactEmail,
        double baseRatePerKwh,
        List<RegisteredAppliance> appliances) {

    public record RegisteredAppliance(
            Long applianceId,
            String name,
            double safeLimitWatt,
            double nominalWatt) {
    }
}
