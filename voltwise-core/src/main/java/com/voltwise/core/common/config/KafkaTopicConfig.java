package com.voltwise.core.common.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic telemetryTopic(VoltWiseProperties properties) {
        return TopicBuilder.name(properties.getKafka().getTelemetryTopic()).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic registrationTopic(VoltWiseProperties properties) {
        return TopicBuilder.name(properties.getKafka().getRegistrationTopic()).partitions(1).replicas(1).build();
    }
}
