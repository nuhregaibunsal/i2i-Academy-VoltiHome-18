package com.voltwise.sensors.model;

public record TelemetryMessage(
        Long homeId,
        Long applianceId,
        double watt,
        double intervalSeconds,
        long timestamp) {
}
