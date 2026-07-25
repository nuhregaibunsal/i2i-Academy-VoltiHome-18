package com.voltwise.core.home.service;

import com.voltwise.core.common.state.ApplianceLiveMetric;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.common.state.LiveStateStore;
import com.voltwise.core.home.domain.ConsumptionSnapshot;
import com.voltwise.core.home.domain.ConsumptionSnapshotRepository;
import com.voltwise.core.home.domain.Home;
import com.voltwise.core.home.domain.HomeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
public class HomeStateRehydrator {

    private final HomeRepository homeRepository;
    private final ConsumptionSnapshotRepository snapshotRepository;
    private final LiveStateStore liveStateStore;

    public HomeStateRehydrator(HomeRepository homeRepository,
                               ConsumptionSnapshotRepository snapshotRepository,
                               LiveStateStore liveStateStore) {
        this.homeRepository = homeRepository;
        this.snapshotRepository = snapshotRepository;
        this.liveStateStore = liveStateStore;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void rehydrate() {
        int restored = 0;
        for (Home home : homeRepository.findAllByOrderByIdAsc()) {
            if (liveStateStore.contains(home.getId())) {
                continue;
            }
            liveStateStore.put(toLiveState(home));
            restored++;
        }
        if (restored > 0) {
            log.info("Rehydrated {} home states from the latest PostgreSQL snapshots into Apache Ignite", restored);
        }
    }

    private HomeLiveState toLiveState(Home home) {
        HomeLiveState state = new HomeLiveState();
        state.setHomeId(home.getId());
        state.setName(home.getName());
        state.setContactEmail(home.getContactEmail());
        state.setBudgetLimit(home.getBudgetLimit());
        state.setBaseRatePerKwh(home.getBaseRatePerKwh());

        double cost = home.getAccumulatedCost();
        double energyWh = 0d;
        ConsumptionSnapshot snapshot = snapshotRepository.findFirstByHomeIdOrderByRecordedAtDesc(home.getId())
                .orElse(null);
        if (snapshot != null) {
            cost = snapshot.getCost();
            energyWh = snapshot.getEnergyWh();
        }
        state.setAccumulatedCost(cost);
        state.setAccumulatedEnergyWh(energyWh);
        state.setPenaltyActive(home.getBudgetLimit() > 0 && cost / home.getBudgetLimit() >= 1.0);
        state.setBreachedAt100(state.isPenaltyActive());
        state.setWarnedAt80(home.getBudgetLimit() > 0 && cost / home.getBudgetLimit() >= 0.8);

        home.getAppliances().forEach(appliance -> state.getAppliances().put(appliance.getId(),
                new ApplianceLiveMetric(appliance.getId(), appliance.getName(), appliance.getSafeLimitWatt(),
                        0d, 0d, 0, false)));
        return state;
    }
}
