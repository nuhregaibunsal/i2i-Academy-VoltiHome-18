package com.voltwise.core.home.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsumptionSnapshotRepository extends JpaRepository<ConsumptionSnapshot, Long> {

    List<ConsumptionSnapshot> findByHomeIdOrderByRecordedAtAsc(Long homeId);
}
