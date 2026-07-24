package com.voltwise.core.home.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "consumption_snapshot")
public class ConsumptionSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "home_id", nullable = false)
    private Long homeId;

    @Column(name = "snapshot_day", nullable = false)
    private LocalDate snapshotDay;

    @Column(name = "energy_wh", nullable = false)
    private double energyWh;

    @Column(name = "cost", nullable = false)
    private double cost;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
