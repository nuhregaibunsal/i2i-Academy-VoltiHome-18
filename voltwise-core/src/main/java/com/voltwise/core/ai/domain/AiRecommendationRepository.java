package com.voltwise.core.ai.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {

    List<AiRecommendation> findByHomeIdOrderByCreatedAtDesc(Long homeId);
}
