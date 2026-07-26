package com.voltwise.core.home.service;

import com.voltwise.core.home.domain.HomeRepository;
import com.voltwise.core.home.dto.ApplianceRequest;
import com.voltwise.core.home.dto.RegisterHomeRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class DemoDataSeeder {

    private static final String DEMO_PASSWORD = "123456";

    private final HomeRepository homeRepository;
    private final HomeService homeService;
    private final boolean enabled;

    public DemoDataSeeder(HomeRepository homeRepository,
                          HomeService homeService,
                          @Value("${voltwise.seed-demo:true}") boolean enabled) {
        this.homeRepository = homeRepository;
        this.homeService = homeService;
        this.enabled = enabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(20)
    public void seed() {
        if (!enabled || homeRepository.count() > 0) {
            return;
        }
        try {
            homeService.register(new RegisterHomeRequest("Yıldız Apt. 3", "testuser@example.com", DEMO_PASSWORD,
                    350, 2.5, List.of(
                    new ApplianceRequest("Buzdolabı", 300, 150),
                    new ApplianceRequest("Klima", 1800, 1200),
                    new ApplianceRequest("Televizyon", 200, 100),
                    new ApplianceRequest("Çamaşır Makinesi", 1500, 800))));

            homeService.register(new RegisterHomeRequest("Papatya Sitesi B-7", "resident2@example.com", DEMO_PASSWORD,
                    250, 2.8, List.of(
                    new ApplianceRequest("Fırın", 2500, 2000),
                    new ApplianceRequest("Bulaşık Makinesi", 1800, 1200),
                    new ApplianceRequest("Buzdolabı", 300, 150))));

            homeService.register(new RegisterHomeRequest("Lale Konağı 12", "resident3@example.com", DEMO_PASSWORD,
                    180, 3.0, List.of(
                    new ApplianceRequest("Klima", 1800, 1200),
                    new ApplianceRequest("Su Isıtıcısı", 2200, 1800),
                    new ApplianceRequest("Televizyon", 200, 100))));

            log.info("Seeded {} demo homes (test resident login: testuser@example.com / {})",
                    homeRepository.count(), DEMO_PASSWORD);
        } catch (Exception ex) {
            log.error("Demo data seeding failed: {}", ex.getMessage());
        }
    }
}
