package com.voltwise.sensors;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VoltWiseSensorsApplication {

    public static void main(String[] args) {
        SpringApplication.run(VoltWiseSensorsApplication.class, args);
    }
}
