package com.voltwise.sensors.registration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltwise.sensors.model.SimulatedAppliance;
import com.voltwise.sensors.model.SimulatedHome;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class RegistrationConsumer {

    private final ObjectMapper objectMapper;
    private final SimulationRegistry registry;

    public RegistrationConsumer(ObjectMapper objectMapper, SimulationRegistry registry) {
        this.objectMapper = objectMapper;
        this.registry = registry;
    }

    @KafkaListener(topics = "${voltwise.kafka.registration-topic}", groupId = "voltwise-sensors")
    public void onMessage(String payload) {
        try {
            RegistrationEvent event = objectMapper.readValue(payload, RegistrationEvent.class);
            List<SimulatedAppliance> appliances = event.appliances().stream()
                    .map(appliance -> new SimulatedAppliance(appliance.applianceId(), appliance.name(),
                            appliance.nominalWatt(), appliance.safeLimitWatt()))
                    .toList();
            registry.register(new SimulatedHome(event.homeId(), event.name(), appliances));
            log.info("Registered home {} with {} appliances into simulation", event.homeId(), appliances.size());
        } catch (Exception ex) {
            log.error("Failed to consume registration event: {}", ex.getMessage());
        }
    }
}
