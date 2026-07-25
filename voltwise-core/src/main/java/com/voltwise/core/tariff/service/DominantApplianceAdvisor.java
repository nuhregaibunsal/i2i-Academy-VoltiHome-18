package com.voltwise.core.tariff.service;

import com.voltwise.core.ai.service.AiNotificationService;
import com.voltwise.core.common.config.VoltWiseProperties;
import com.voltwise.core.common.state.ApplianceLiveMetric;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.common.state.LiveStateStore;
import com.voltwise.core.home.domain.EventType;
import com.voltwise.core.telemetry.service.AlertPersistenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
public class DominantApplianceAdvisor {

    private static final double MIN_ENERGY_WH = 50d;

    private final LiveStateStore liveStateStore;
    private final AiNotificationService aiNotificationService;
    private final AlertPersistenceService alertPersistenceService;
    private final double threshold;

    public DominantApplianceAdvisor(LiveStateStore liveStateStore,
                                    AiNotificationService aiNotificationService,
                                    AlertPersistenceService alertPersistenceService,
                                    VoltWiseProperties properties) {
        this.liveStateStore = liveStateStore;
        this.aiNotificationService = aiNotificationService;
        this.alertPersistenceService = alertPersistenceService;
        this.threshold = properties.getTariff().getDominantApplianceThreshold();
    }

    @Scheduled(fixedDelayString = "${voltwise.dominant-advice-interval-ms:45000}")
    public void evaluate() {
        for (HomeLiveState snapshot : liveStateStore.findAll()) {
            if (snapshot.getAccumulatedEnergyWh() < MIN_ENERGY_WH) {
                continue;
            }
            AtomicReference<AlertTrigger> fire = new AtomicReference<>();
            HomeLiveState state = liveStateStore.mutate(snapshot.getHomeId(), current -> detect(current, fire));
            if (state != null && fire.get() != null) {
                try {
                    alertPersistenceService.persist(state, List.of(fire.get()));
                } catch (Exception ex) {
                    log.error("Failed to log dominant-appliance advice for home {}: {}",
                            state.getHomeId(), ex.getMessage());
                }
                aiNotificationService.dispatch(state, fire.get());
            }
        }
    }

    private void detect(HomeLiveState state, AtomicReference<AlertTrigger> fire) {
        double total = state.getAppliances().values().stream()
                .mapToDouble(ApplianceLiveMetric::getCumulativeWh).sum();
        ApplianceLiveMetric top = state.getAppliances().values().stream()
                .max(Comparator.comparingDouble(ApplianceLiveMetric::getCumulativeWh))
                .orElse(null);

        if (top != null && total > 0 && top.getCumulativeWh() / total >= threshold) {
            if (!Objects.equals(state.getDominantAdviceApplianceId(), top.getApplianceId())) {
                state.setDominantAdviceApplianceId(top.getApplianceId());
                int share = (int) Math.round((top.getCumulativeWh() / total) * 100d);
                fire.set(AlertTrigger.notifiable(EventType.DOMINANT_APPLIANCE_ADVICE,
                        "'" + top.getName() + "' cihazı toplam tüketimin %" + share
                                + "'ini tek başına oluşturuyor"));
            }
        } else {
            state.setDominantAdviceApplianceId(null);
        }
    }
}
