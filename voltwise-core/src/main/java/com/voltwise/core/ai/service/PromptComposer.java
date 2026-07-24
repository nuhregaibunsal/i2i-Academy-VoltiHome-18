package com.voltwise.core.ai.service;

import com.voltwise.core.common.state.ApplianceLiveMetric;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.tariff.service.AlertTrigger;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class PromptComposer {

    public String compose(HomeLiveState state, AlertTrigger trigger) {
        String anomalies = state.getAppliances().values().stream()
                .filter(ApplianceLiveMetric::isAnomalous)
                .map(ApplianceLiveMetric::getName)
                .collect(Collectors.joining(", "));
        if (anomalies.isBlank()) {
            anomalies = "yok";
        }

        return String.format(Locale.US,
                """
                Sen VoltWise adlı bir enerji tasarrufu asistanısın. Aşağıdaki ev verilerine göre,
                kullanıcıya Türkçe, kısa (en fazla 4 cümle), kişiselleştirilmiş ve uygulanabilir bir
                enerji tasarrufu tavsiyesi yaz. Teknik jargon kullanma, sıcak ve yönlendirici bir dil kullan.

                Ev adı: %s
                Tetikleyen durum: %s
                Bütçe limiti: %.2f TL
                Şu ana kadar biriken tutar: %.2f TL
                Bütçe kullanım oranı: %%%.0f
                Ceza tarifesi aktif mi: %s
                Anomali gösteren cihazlar: %s

                Sadece tavsiye metnini döndür.
                """,
                state.getName(),
                trigger.detail(),
                state.getBudgetLimit(),
                state.getAccumulatedCost(),
                state.budgetUsageRatio() * 100d,
                state.isPenaltyActive() ? "evet" : "hayır",
                anomalies);
    }
}
