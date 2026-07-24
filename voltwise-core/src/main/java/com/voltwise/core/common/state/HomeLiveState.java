package com.voltwise.core.common.state;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

@Data
@NoArgsConstructor
public class HomeLiveState implements Serializable {

    private Long homeId;
    private String name;
    private String contactEmail;
    private double budgetLimit;
    private double baseRatePerKwh;
    private double accumulatedEnergyWh;
    private double accumulatedCost;
    private boolean penaltyActive;
    private boolean warnedAt80;
    private boolean breachedAt100;
    private Map<Long, ApplianceLiveMetric> appliances = new LinkedHashMap<>();

    public double budgetUsageRatio() {
        if (budgetLimit <= 0) {
            return 0d;
        }
        return accumulatedCost / budgetLimit;
    }
}
