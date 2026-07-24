package com.voltwise.core.telemetry.service;

import com.voltwise.core.ai.service.AiNotificationService;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.common.state.LiveStateStore;
import com.voltwise.core.tariff.service.AlertTrigger;
import com.voltwise.core.tariff.service.TariffEvaluator;
import com.voltwise.core.telemetry.dto.TelemetryMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
public class TelemetryProcessingService {

    private final LiveStateStore liveStateStore;
    private final TariffEvaluator tariffEvaluator;
    private final AlertPersistenceService alertPersistenceService;
    private final AiNotificationService aiNotificationService;

    public TelemetryProcessingService(LiveStateStore liveStateStore,
                                      TariffEvaluator tariffEvaluator,
                                      AlertPersistenceService alertPersistenceService,
                                      AiNotificationService aiNotificationService) {
        this.liveStateStore = liveStateStore;
        this.tariffEvaluator = tariffEvaluator;
        this.alertPersistenceService = alertPersistenceService;
        this.aiNotificationService = aiNotificationService;
    }

    public void process(TelemetryMessage message) {
        if (message.homeId() == null || !liveStateStore.contains(message.homeId())) {
            return;
        }

        AtomicReference<List<AlertTrigger>> triggerHolder = new AtomicReference<>(List.of());
        HomeLiveState state = liveStateStore.mutate(message.homeId(),
                current -> triggerHolder.set(tariffEvaluator.apply(current, message)));
        if (state == null) {
            return;
        }

        List<AlertTrigger> triggers = triggerHolder.get();
        if (triggers.isEmpty()) {
            return;
        }

        try {
            alertPersistenceService.persist(state, triggers);
        } catch (Exception ex) {
            log.error("Failed to persist event logs for home {}: {}", state.getHomeId(), ex.getMessage());
        }
        triggers.stream()
                .filter(AlertTrigger::notifiable)
                .forEach(trigger -> aiNotificationService.dispatch(state, trigger));
    }
}
