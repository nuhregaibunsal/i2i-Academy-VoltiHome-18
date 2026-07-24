package com.voltwise.core.home.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltwise.core.common.config.VoltWiseProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RegistrationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final VoltWiseProperties properties;

    public RegistrationEventPublisher(KafkaTemplate<String, String> kafkaTemplate,
                                      ObjectMapper objectMapper,
                                      VoltWiseProperties properties) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    public void publish(RegistrationEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(properties.getKafka().getRegistrationTopic(), String.valueOf(event.homeId()), payload);
            log.info("Published registration event for home {}", event.homeId());
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize registration event for home {}", event.homeId(), ex);
        }
    }
}
