package com.voltwise.core.home.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RegistrationBroadcaster {

    private final HomeService homeService;

    public RegistrationBroadcaster(HomeService homeService) {
        this.homeService = homeService;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(30)
    public void broadcast() {
        try {
            homeService.republishRegistrations();
            log.info("Republished registration events for existing homes");
        } catch (Exception ex) {
            log.error("Registration re-broadcast failed: {}", ex.getMessage());
        }
    }
}
