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
        double effectiveRate = state.getBaseRatePerKwh() * tariffMultiplier(state.budgetUsageRatio());
        double costDelta = (energyWh / 1000d) * effectiveRate;

        state.setAccumulatedEnergyWh(state.getAccumulatedEnergyWh() + energyWh);
        state.setAccumulatedCost(state.getAccumulatedCost() + costDelta);

        evaluateAppliance(state, message, energyWh, triggers);
        evaluateQuota(state, triggers);

        return triggers;
    }

    public double tariffMultiplier(double usageRatio) {
        if (usageRatio < config.getBreachThreshold()) {
            return 1d;
        }
        int tier = (int) Math.floor((usageRatio - config.getBreachThreshold()) / config.getPenaltyStep());
        if (tier < 0) {
            tier = 0;
        }
        double multiplier = config.getPenaltyMultiplier() + tier * config.getPenaltyIncrement();
        double cap = config.getPenaltyMaxMultiplier();
        if (cap > 0 && multiplier > cap) {
            return cap;
        }
        return multiplier;
    }

    public int tierOf(double usageRatio) {
        if (usageRatio < config.getBreachThreshold()) {
            return -1;
        }
        int tier = (int) Math.floor((usageRatio - config.getBreachThreshold()) / config.getPenaltyStep());
        if (tier < 0) {
            tier = 0;
        }
        double cap = config.getPenaltyMaxMultiplier();
        if (cap > 0 && config.getPenaltyIncrement() > 0) {
            int maxTier = (int) Math.floor((cap - config.getPenaltyMultiplier()) / config.getPenaltyIncrement());
            if (maxTier < 0) {
                maxTier = 0;
            }
            if (tier > maxTier) {
                tier = maxTier;
            }
        }
        return tier;
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
                int overage = Math.max(0, (int) Math.round((message.watt() / metric.getSafeLimitWatt() - 1d) * 100d));
                triggers.add(AlertTrigger.notifiable(EventType.APPLIANCE_ANOMALY,
                        "“" + metric.getName() + "” güvenli limiti %" + overage + " aştı ("
                                + Math.round(message.watt()) + "W > " + Math.round(metric.getSafeLimitWatt())
                                + "W, " + metric.getConsecutiveBreaches() + " ardışık döngü)"));
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
                        state.getName() + " bütçesinin %100'üne ulaştı — ceza tarifesi devrede"));
            }
            if (!state.isPenaltyActive()) {
                state.setPenaltyActive(true);
                triggers.add(AlertTrigger.silent(EventType.PENALTY_TARIFF_ACTIVATED,
                        "Graduated penalty tariff activated (starts at x" + config.getPenaltyMultiplier()
                                + ", +" + config.getPenaltyIncrement() + " each "
                                + Math.round(config.getPenaltyStep() * 100) + "% over budget)"));
            }
        } else if (ratio >= config.getWarningThreshold() && !state.isWarnedAt80()) {
            state.setWarnedAt80(true);
            triggers.add(AlertTrigger.notifiable(EventType.QUOTA_WARNING_80,
                    state.getName() + " bütçesinin %80'ine ulaştı"));
        }
    }
}
