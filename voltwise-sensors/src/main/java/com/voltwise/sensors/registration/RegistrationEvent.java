package com.voltwise.sensors.registration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegistrationEvent(
        Long homeId,
        String name,
        String contactEmail,
        double baseRatePerKwh,
        List<RegisteredAppliance> appliances) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RegisteredAppliance(
            Long applianceId,
            String name,
            double safeLimitWatt,
            double nominalWatt) {
    }
}
