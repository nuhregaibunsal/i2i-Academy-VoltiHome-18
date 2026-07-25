package com.voltwise.core.home.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "home")
public class Home {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "budget_limit", nullable = false)
    private double budgetLimit;

    @Column(name = "base_rate_per_kwh", nullable = false)
    private double baseRatePerKwh;

    @Column(name = "accumulated_cost", nullable = false)
    private double accumulatedCost;

    @Column(name = "penalty_active", nullable = false)
    private boolean penaltyActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<Appliance> appliances = new ArrayList<>();

    public void addAppliance(Appliance appliance) {
        appliance.setHome(this);
        appliances.add(appliance);
    }
}
