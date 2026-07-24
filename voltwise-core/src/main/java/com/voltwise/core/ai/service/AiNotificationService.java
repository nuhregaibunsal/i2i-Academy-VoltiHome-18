package com.voltwise.core.ai.service;

import com.voltwise.core.ai.domain.AiRecommendation;
import com.voltwise.core.ai.domain.AiRecommendationRepository;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.tariff.service.AlertTrigger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AiNotificationService {

    private final PromptComposer promptComposer;
    private final GeminiClient geminiClient;
    private final EmailSender emailSender;
    private final AiRecommendationRepository recommendationRepository;

    public AiNotificationService(PromptComposer promptComposer,
                                 GeminiClient geminiClient,
                                 EmailSender emailSender,
                                 AiRecommendationRepository recommendationRepository) {
        this.promptComposer = promptComposer;
        this.geminiClient = geminiClient;
        this.emailSender = emailSender;
        this.recommendationRepository = recommendationRepository;
    }

    @Async
    public void dispatch(HomeLiveState state, AlertTrigger trigger) {
        try {
            String prompt = promptComposer.compose(state, trigger);
            String content = geminiClient.generate(prompt);

            AiRecommendation recommendation = new AiRecommendation();
            recommendation.setHomeId(state.getHomeId());
            recommendation.setTriggerReason(trigger.type().name());
            recommendation.setContent(content);
            recommendation.setDelivered(false);
            recommendation = recommendationRepository.save(recommendation);

            boolean delivered = emailSender.send(state.getContactEmail(),
                    "VoltWise Enerji Uyarısı - " + state.getName(), content);
            if (delivered) {
                recommendation.setDelivered(true);
                recommendationRepository.save(recommendation);
            }
        } catch (Exception ex) {
            log.error("AI notification pipeline failed for home {}: {}", state.getHomeId(), ex.getMessage());
        }
    }
}
