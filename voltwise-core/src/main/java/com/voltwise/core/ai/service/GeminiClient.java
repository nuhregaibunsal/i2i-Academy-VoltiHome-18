package com.voltwise.core.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltwise.core.common.config.VoltWiseProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiClient {

    private static final String FALLBACK_TEXT =
            "Enerji tüketiminiz bütçe sınırınıza yaklaştı. Yüksek güç çeken cihazları " +
            "yoğun saatlerde kapatarak ve kullanımı gün içine yayarak tasarruf edebilirsiniz.";

    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;
    private final VoltWiseProperties.Gemini config;

    public GeminiClient(RestClient geminiRestClient, ObjectMapper objectMapper, VoltWiseProperties properties) {
        this.geminiRestClient = geminiRestClient;
        this.objectMapper = objectMapper;
        this.config = properties.getGemini();
    }

    public String generate(String prompt) {
        if (config.getApiKey() == null || config.getApiKey().isBlank()) {
            log.warn("Gemini API key is not configured, using fallback recommendation");
            return FALLBACK_TEXT;
        }
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
            String raw = geminiRestClient.post()
                    .uri("/models/{model}:generateContent?key={key}", config.getModel(), config.getApiKey())
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return extractText(raw);
        } catch (Exception ex) {
            log.error("Gemini generation failed, returning fallback text: {}", ex.getMessage());
            return FALLBACK_TEXT;
        }
    }

    private String extractText(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (text.isTextual() && !text.asText().isBlank()) {
                return text.asText().trim();
            }
        } catch (Exception ex) {
            log.error("Unable to parse Gemini response: {}", ex.getMessage());
        }
        return FALLBACK_TEXT;
    }
}
