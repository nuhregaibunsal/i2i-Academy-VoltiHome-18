package com.voltwise.sensors.registration;

import com.voltwise.sensors.model.SimulatedHome;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SimulationRegistry {

    private final ConcurrentHashMap<Long, SimulatedHome> homes = new ConcurrentHashMap<>();

    public void register(SimulatedHome home) {
        homes.put(home.getHomeId(), home);
    }

    public Collection<SimulatedHome> all() {
        return homes.values();
    }

    public boolean isEmpty() {
        return homes.isEmpty();
    }
}
