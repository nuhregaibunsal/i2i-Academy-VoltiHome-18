package com.voltwise.core.home.dto;

import java.time.Instant;
import java.time.LocalDate;

public record ConsumptionHistoryPoint(
        LocalDate day,
        Instant recordedAt,
        double energyWh,
        double cost) {
}
