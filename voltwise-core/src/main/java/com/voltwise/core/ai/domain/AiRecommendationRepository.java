package com.voltwise.core.ai.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {

    Page<AiRecommendation> findByHomeId(Long homeId, Pageable pageable);
}
