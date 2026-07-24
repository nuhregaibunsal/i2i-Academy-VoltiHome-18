package com.voltwise.core.telemetry.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TelemetryMessage(
        Long homeId,
        Long applianceId,
        double watt,
        double intervalSeconds,
        long timestamp) {
}
