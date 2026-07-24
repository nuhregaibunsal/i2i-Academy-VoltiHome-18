package com.voltwise.sensors.generator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltwise.sensors.model.TelemetryMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TelemetryPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String telemetryTopic;

    public TelemetryPublisher(KafkaTemplate<String, String> kafkaTemplate,
                              ObjectMapper objectMapper,
                              @Value("${voltwise.kafka.telemetry-topic}") String telemetryTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.telemetryTopic = telemetryTopic;
    }

    public void publish(TelemetryMessage message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(telemetryTopic, String.valueOf(message.homeId()), payload);
        } catch (Exception ex) {
            log.error("Failed to publish telemetry for home {}: {}", message.homeId(), ex.getMessage());
        }
    }
}
