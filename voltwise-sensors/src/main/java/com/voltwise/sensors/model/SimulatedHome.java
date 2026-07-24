package com.voltwise.sensors.model;

import lombok.Getter;

import java.util.List;

@Getter
public class SimulatedHome {

    private final Long homeId;
    private final String name;
    private final List<SimulatedAppliance> appliances;

    public SimulatedHome(Long homeId, String name, List<SimulatedAppliance> appliances) {
        this.homeId = homeId;
        this.name = name;
        this.appliances = List.copyOf(appliances);
    }
}
