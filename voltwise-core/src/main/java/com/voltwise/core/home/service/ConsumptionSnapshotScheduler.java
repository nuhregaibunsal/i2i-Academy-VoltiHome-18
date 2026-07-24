package com.voltwise.core.home.service;

import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.common.state.LiveStateStore;
import com.voltwise.core.home.domain.ConsumptionSnapshot;
import com.voltwise.core.home.domain.ConsumptionSnapshotRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Service
public class ConsumptionSnapshotScheduler {

    private final LiveStateStore liveStateStore;
    private final ConsumptionSnapshotRepository snapshotRepository;

    public ConsumptionSnapshotScheduler(LiveStateStore liveStateStore,
                                        ConsumptionSnapshotRepository snapshotRepository) {
        this.liveStateStore = liveStateStore;
        this.snapshotRepository = snapshotRepository;
    }

    @Scheduled(fixedDelayString = "${voltwise.snapshot-interval-ms:60000}")
    @Transactional
    public void captureSnapshots() {
        List<HomeLiveState> states = liveStateStore.findAll();
        if (states.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        LocalDate today = LocalDate.ofInstant(now, ZoneOffset.UTC);
        for (HomeLiveState state : states) {
            ConsumptionSnapshot snapshot = new ConsumptionSnapshot();
            snapshot.setHomeId(state.getHomeId());
            snapshot.setSnapshotDay(today);
            snapshot.setRecordedAt(now);
            snapshot.setEnergyWh(state.getAccumulatedEnergyWh());
            snapshot.setCost(state.getAccumulatedCost());
            snapshotRepository.save(snapshot);
        }
        log.debug("Captured {} consumption snapshots", states.size());
    }
}
