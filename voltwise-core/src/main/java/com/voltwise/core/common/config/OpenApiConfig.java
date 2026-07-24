package com.voltwise.core.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI voltWiseOpenApi() {
        return new OpenAPI().info(new Info()
                .title("VoltWise Core API")
                .description("Real-time IoT energy analytics and budget auditing platform")
                .version("1.0.0")
                .license(new License().name("i2i Academy")));
    }
}
