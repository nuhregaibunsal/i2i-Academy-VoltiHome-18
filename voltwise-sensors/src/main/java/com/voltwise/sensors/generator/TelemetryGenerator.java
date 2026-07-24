package com.voltwise.sensors.generator;

import com.voltwise.sensors.model.SimulatedAppliance;
import com.voltwise.sensors.model.SimulatedHome;
import com.voltwise.sensors.model.TelemetryMessage;
import com.voltwise.sensors.registration.SimulationRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class TelemetryGenerator {

    private final SimulationRegistry registry;
    private final TelemetryPublisher publisher;
    private final double anomalyProbability;
    private final double intervalSeconds;

    public TelemetryGenerator(SimulationRegistry registry,
                              TelemetryPublisher publisher,
                              @Value("${voltwise.simulation.anomaly-probability}") double anomalyProbability,
                              @Value("${voltwise.simulation.interval-ms}") long intervalMs) {
        this.registry = registry;
        this.publisher = publisher;
        this.anomalyProbability = anomalyProbability;
        this.intervalSeconds = intervalMs / 1000d;
    }

    @Scheduled(fixedDelayString = "${voltwise.simulation.interval-ms}")
    public void emit() {
        if (registry.isEmpty()) {
            return;
        }
        long now = System.currentTimeMillis();
        for (SimulatedHome home : registry.all()) {
            for (SimulatedAppliance appliance : home.getAppliances()) {
                double watt = nextWatt(appliance);
                publisher.publish(new TelemetryMessage(home.getHomeId(), appliance.getApplianceId(),
                        round(watt), intervalSeconds, now));
            }
        }
    }

    private double nextWatt(SimulatedAppliance appliance) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        if (random.nextDouble() < anomalyProbability) {
            return appliance.getSafeLimitWatt() * random.nextDouble(1.05, 1.5);
        }
        double fluctuation = random.nextDouble(0.55, 1.1);
        return Math.min(appliance.getNominalWatt() * fluctuation, appliance.getSafeLimitWatt());
    }

    private double round(double value) {
        return Math.round(value * 100d) / 100d;
    }
}
