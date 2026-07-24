package com.voltwise.sensors.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SimulatedAppliance {

    private final Long applianceId;
    private final String name;
    private final double nominalWatt;
    private final double safeLimitWatt;
}
