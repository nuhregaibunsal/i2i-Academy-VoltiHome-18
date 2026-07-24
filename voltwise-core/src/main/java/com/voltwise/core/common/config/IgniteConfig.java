package com.voltwise.core.common.config;

import org.apache.ignite.Ignition;
import org.apache.ignite.client.IgniteClient;
import org.apache.ignite.configuration.ClientConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IgniteConfig {

    public static final String HOME_STATE_CACHE = "homeLiveState";

    @Bean(destroyMethod = "close")
    public IgniteClient igniteClient(VoltWiseProperties properties) {
        String endpoint = properties.getIgnite().getHost() + ":" + properties.getIgnite().getPort();
        ClientConfiguration configuration = new ClientConfiguration()
                .setAddresses(endpoint);
        return Ignition.startClient(configuration);
    }
}
