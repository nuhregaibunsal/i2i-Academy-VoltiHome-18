package com.voltwise.core.home.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    List<EventLog> findByHomeIdOrderByOccurredAtDesc(Long homeId);
}
