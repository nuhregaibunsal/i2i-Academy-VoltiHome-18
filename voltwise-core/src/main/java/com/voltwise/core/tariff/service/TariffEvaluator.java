package com.voltwise.core.tariff.service;

import com.voltwise.core.common.config.VoltWiseProperties;
import com.voltwise.core.common.state.ApplianceLiveMetric;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.home.domain.EventType;
import com.voltwise.core.telemetry.dto.TelemetryMessage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TariffEvaluator {

    private final VoltWiseProperties.Tariff config;

    public TariffEvaluator(VoltWiseProperties properties) {
        this.config = properties.getTariff();
    }

    public List<AlertTrigger> apply(HomeLiveState state, TelemetryMessage message) {
        List<AlertTrigger> triggers = new ArrayList<>();

        double energyWh = message.watt() * message.intervalSeconds() / 3600d;
        double effectiveRate = state.getBaseRatePerKwh() * (state.isPenaltyActive() ? config.getPenaltyMultiplier() : 1d);
        double costDelta = (energyWh / 1000d) * effectiveRate;

        state.setAccumulatedEnergyWh(state.getAccumulatedEnergyWh() + energyWh);
        state.setAccumulatedCost(state.getAccumulatedCost() + costDelta);

        evaluateAppliance(state, message, energyWh, triggers);
        evaluateQuota(state, triggers);

        return triggers;
    }

    private void evaluateAppliance(HomeLiveState state, TelemetryMessage message, double energyWh,
                                   List<AlertTrigger> triggers) {
        ApplianceLiveMetric metric = state.getAppliances().get(message.applianceId());
        if (metric == null) {
            return;
        }
        metric.setLastWatt(message.watt());
        metric.setCumulativeWh(metric.getCumulativeWh() + energyWh);

        if (message.watt() > metric.getSafeLimitWatt()) {
            metric.setConsecutiveBreaches(metric.getConsecutiveBreaches() + 1);
            if (metric.getConsecutiveBreaches() >= config.getConsecutiveBreachLimit() && !metric.isAnomalous()) {
                metric.setAnomalous(true);
                triggers.add(AlertTrigger.notifiable(EventType.APPLIANCE_ANOMALY,
                        "Appliance '" + metric.getName() + "' exceeded its safe limit for "
                                + metric.getConsecutiveBreaches() + " consecutive cycles"));
            }
        } else {
            metric.setConsecutiveBreaches(0);
            metric.setAnomalous(false);
        }
    }

    private void evaluateQuota(HomeLiveState state, List<AlertTrigger> triggers) {
        double ratio = state.budgetUsageRatio();

        if (ratio >= config.getBreachThreshold()) {
            if (!state.isBreachedAt100()) {
                state.setBreachedAt100(true);
                triggers.add(AlertTrigger.notifiable(EventType.QUOTA_BREACH_100,
                        "Home '" + state.getName() + "' reached 100% of its budget quota"));
            }
            if (!state.isPenaltyActive()) {
                state.setPenaltyActive(true);
                triggers.add(AlertTrigger.silent(EventType.PENALTY_TARIFF_ACTIVATED,
                        "Penalty tariff activated at x" + config.getPenaltyMultiplier() + " rate"));
            }
        } else if (ratio >= config.getWarningThreshold() && !state.isWarnedAt80()) {
            state.setWarnedAt80(true);
            triggers.add(AlertTrigger.notifiable(EventType.QUOTA_WARNING_80,
                    "Home '" + state.getName() + "' reached 80% of its budget quota"));
        }
    }
}
