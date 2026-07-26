package com.voltwise.core.telemetry.service;

import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.home.domain.EventLog;
import com.voltwise.core.home.domain.EventLogRepository;
import com.voltwise.core.home.domain.Home;
import com.voltwise.core.home.domain.HomeRepository;
import com.voltwise.core.home.domain.Notification;
import com.voltwise.core.home.domain.NotificationRepository;
import com.voltwise.core.tariff.service.AlertTrigger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class AlertPersistenceService {

    private final EventLogRepository eventLogRepository;
    private final NotificationRepository notificationRepository;
    private final HomeRepository homeRepository;

    public AlertPersistenceService(EventLogRepository eventLogRepository,
                                   NotificationRepository notificationRepository,
                                   HomeRepository homeRepository) {
        this.eventLogRepository = eventLogRepository;
        this.notificationRepository = notificationRepository;
        this.homeRepository = homeRepository;
    }

    @Transactional
    public void persist(HomeLiveState state, List<AlertTrigger> triggers) {
        for (AlertTrigger trigger : triggers) {
            EventLog eventLog = new EventLog();
            eventLog.setHomeId(state.getHomeId());
            eventLog.setEventType(trigger.type());
            eventLog.setDetail(trigger.detail());
            eventLogRepository.save(eventLog);

            if (trigger.notifiable()) {
                Notification notification = new Notification();
                notification.setHomeId(state.getHomeId());
                notification.setHomeName(state.getName());
                notification.setType(trigger.type());
                notification.setMessage(trigger.detail());
                notification.setRead(false);
                notificationRepository.save(notification);
            }
        }
        homeRepository.findById(state.getHomeId()).ifPresent(home -> {
            home.setAccumulatedCost(state.getAccumulatedCost());
            home.setPenaltyActive(state.isPenaltyActive());
            homeRepository.save(home);
        });
    }
}
