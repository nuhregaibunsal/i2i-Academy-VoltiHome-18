package com.voltwise.core.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "voltwise")
public class VoltWiseProperties {

    private final Kafka kafka = new Kafka();
    private final Ignite ignite = new Ignite();
    private final Tariff tariff = new Tariff();
    private final Mail mail = new Mail();
    private final Gemini gemini = new Gemini();

    @Getter
    @Setter
    public static class Kafka {
        private String telemetryTopic;
        private String registrationTopic;
    }

    @Getter
    @Setter
    public static class Ignite {
        private String host;
        private int port;
    }

    @Getter
    @Setter
    public static class Tariff {
        private double warningThreshold;
        private double breachThreshold;
        private double penaltyMultiplier;
        private double penaltyStep;
        private double penaltyIncrement;
        private double dominantApplianceThreshold;
        private int consecutiveBreachLimit;
    }

    @Getter
    @Setter
    public static class Mail {
        private String from;
    }

    @Getter
    @Setter
    public static class Gemini {
        private String apiKey;
        private String model;
        private String baseUrl;
    }
}
