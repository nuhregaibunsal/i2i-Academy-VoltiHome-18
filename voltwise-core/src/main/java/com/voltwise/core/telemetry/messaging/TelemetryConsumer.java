package com.voltwise.core.telemetry.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltwise.core.telemetry.dto.TelemetryMessage;
import com.voltwise.core.telemetry.service.TelemetryProcessingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TelemetryConsumer {

    private final ObjectMapper objectMapper;
    private final TelemetryProcessingService telemetryProcessingService;

    public TelemetryConsumer(ObjectMapper objectMapper, TelemetryProcessingService telemetryProcessingService) {
        this.objectMapper = objectMapper;
        this.telemetryProcessingService = telemetryProcessingService;
    }

    @KafkaListener(topics = "${voltwise.kafka.telemetry-topic}", groupId = "voltwise-core")
    public void onMessage(String payload) {
        try {
            TelemetryMessage message = objectMapper.readValue(payload, TelemetryMessage.class);
            telemetryProcessingService.process(message);
        } catch (Exception ex) {
            log.error("Failed to process telemetry payload: {}", ex.getMessage());
        }
    }
}
