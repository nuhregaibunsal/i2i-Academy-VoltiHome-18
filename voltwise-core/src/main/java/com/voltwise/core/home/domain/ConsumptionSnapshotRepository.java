package com.voltwise.core.home.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsumptionSnapshotRepository extends JpaRepository<ConsumptionSnapshot, Long> {

    Page<ConsumptionSnapshot> findByHomeId(Long homeId, Pageable pageable);

    Optional<ConsumptionSnapshot> findFirstByHomeIdOrderByRecordedAtDesc(Long homeId);
}
