package com.voltwise.core.home.service;

import com.voltwise.core.ai.domain.AiRecommendation;
import com.voltwise.core.ai.domain.AiRecommendationRepository;
import com.voltwise.core.common.exception.ResourceNotFoundException;
import com.voltwise.core.common.exception.UnauthorizedException;
import com.voltwise.core.common.state.ApplianceLiveMetric;
import com.voltwise.core.common.state.HomeLiveState;
import com.voltwise.core.common.state.LiveStateStore;
import com.voltwise.core.home.domain.Appliance;
import com.voltwise.core.home.domain.ConsumptionSnapshot;
import com.voltwise.core.home.domain.ConsumptionSnapshotRepository;
import com.voltwise.core.home.domain.Home;
import com.voltwise.core.home.domain.HomeRepository;
import com.voltwise.core.home.dto.ApplianceStatusResponse;
import com.voltwise.core.home.dto.ConsumerLoginRequest;
import com.voltwise.core.home.dto.ConsumerLoginResponse;
import com.voltwise.core.home.dto.ConsumptionHistoryPoint;
import com.voltwise.core.home.dto.HomeRegisteredResponse;
import com.voltwise.core.home.dto.HomeStatusResponse;
import com.voltwise.core.home.dto.HomeSummaryResponse;
import com.voltwise.core.home.dto.RecommendationResponse;
import com.voltwise.core.home.dto.RegisterHomeRequest;
import com.voltwise.core.common.web.PagedResponse;
import com.voltwise.core.home.messaging.RegistrationEvent;
import com.voltwise.core.home.messaging.RegistrationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final ConsumptionSnapshotRepository snapshotRepository;
    private final AiRecommendationRepository recommendationRepository;
    private final LiveStateStore liveStateStore;
    private final RegistrationEventPublisher registrationEventPublisher;
    private final PasswordEncoder passwordEncoder;

    public HomeService(HomeRepository homeRepository,
                       ConsumptionSnapshotRepository snapshotRepository,
                       AiRecommendationRepository recommendationRepository,
                       LiveStateStore liveStateStore,
                       RegistrationEventPublisher registrationEventPublisher,
                       PasswordEncoder passwordEncoder) {
        this.homeRepository = homeRepository;
        this.snapshotRepository = snapshotRepository;
        this.recommendationRepository = recommendationRepository;
        this.liveStateStore = liveStateStore;
        this.registrationEventPublisher = registrationEventPublisher;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public HomeRegisteredResponse register(RegisterHomeRequest request) {
        Home home = new Home();
        home.setName(request.name());
        home.setContactEmail(request.contactEmail());
        home.setPasswordHash(passwordEncoder.encode(request.password()));
        home.setBudgetLimit(request.budgetLimit());
        home.setBaseRatePerKwh(request.baseRatePerKwh());
        request.appliances().forEach(applianceRequest -> {
            Appliance appliance = new Appliance();
            appliance.setName(applianceRequest.name());
            appliance.setSafeLimitWatt(applianceRequest.safeLimitWatt());
            appliance.setNominalWatt(applianceRequest.nominalWatt());
            home.addAppliance(appliance);
        });

        Home saved = homeRepository.save(home);

        liveStateStore.put(toLiveState(saved));
        registrationEventPublisher.publish(toRegistrationEvent(saved));

        return toRegisteredResponse(saved);
    }

    @Transactional(readOnly = true)
    public ConsumerLoginResponse consumerLogin(ConsumerLoginRequest request) {
        return homeRepository.findByContactEmailIgnoreCase(request.email().trim()).stream()
                .filter(home -> passwordEncoder.matches(request.password(), home.getPasswordHash()))
                .findFirst()
                .map(home -> new ConsumerLoginResponse(home.getId(), home.getName()))
                .orElseThrow(() -> new UnauthorizedException("E-posta veya şifre hatalı"));
    }

    @Transactional(readOnly = true)
    public List<HomeSummaryResponse> listSummaries() {
        return liveStateStore.findAll().stream()
                .sorted(Comparator.comparing(HomeLiveState::getHomeId))
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public HomeStatusResponse getStatus(Long homeId) {
        HomeLiveState state = liveStateStore.find(homeId)
                .orElseThrow(() -> new ResourceNotFoundException("Home " + homeId + " is not registered"));
        return toStatus(state);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ConsumptionHistoryPoint> getHistory(Long homeId, int page, int size) {
        if (!homeRepository.existsById(homeId)) {
            throw new ResourceNotFoundException("Home " + homeId + " is not registered");
        }
        Page<ConsumptionSnapshot> result = snapshotRepository.findByHomeId(homeId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "recordedAt")));
        return PagedResponse.of(result, result.getContent().stream().map(this::toHistoryPoint).toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<RecommendationResponse> getRecommendations(Long homeId, int page, int size) {
        if (!homeRepository.existsById(homeId)) {
            throw new ResourceNotFoundException("Home " + homeId + " is not registered");
        }
        Page<AiRecommendation> result = recommendationRepository.findByHomeId(homeId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PagedResponse.of(result, result.getContent().stream().map(this::toRecommendationResponse).toList());
    }

    private RecommendationResponse toRecommendationResponse(AiRecommendation recommendation) {
        return new RecommendationResponse(recommendation.getId(), recommendation.getTriggerReason(),
                recommendation.getContent(), recommendation.isDelivered(), recommendation.getCreatedAt());
    }

    private HomeLiveState toLiveState(Home home) {
        HomeLiveState state = new HomeLiveState();
        state.setHomeId(home.getId());
        state.setName(home.getName());
        state.setContactEmail(home.getContactEmail());
        state.setBudgetLimit(home.getBudgetLimit());
        state.setBaseRatePerKwh(home.getBaseRatePerKwh());
        home.getAppliances().forEach(appliance -> state.getAppliances().put(appliance.getId(),
                new ApplianceLiveMetric(appliance.getId(), appliance.getName(), appliance.getSafeLimitWatt(),
                        0d, 0d, 0, false)));
        return state;
    }

    private RegistrationEvent toRegistrationEvent(Home home) {
        List<RegistrationEvent.RegisteredAppliance> appliances = home.getAppliances().stream()
                .map(appliance -> new RegistrationEvent.RegisteredAppliance(appliance.getId(), appliance.getName(),
                        appliance.getSafeLimitWatt(), appliance.getNominalWatt()))
                .toList();
        return new RegistrationEvent(home.getId(), home.getName(), home.getContactEmail(),
                home.getBaseRatePerKwh(), appliances);
    }

    private HomeRegisteredResponse toRegisteredResponse(Home home) {
        List<HomeRegisteredResponse.RegisteredAppliance> appliances = home.getAppliances().stream()
                .map(appliance -> new HomeRegisteredResponse.RegisteredAppliance(appliance.getId(),
                        appliance.getName(), appliance.getSafeLimitWatt(), appliance.getNominalWatt()))
                .toList();
        return new HomeRegisteredResponse(home.getId(), home.getName(), home.getContactEmail(),
                home.getBudgetLimit(), home.getBaseRatePerKwh(), appliances);
    }

    private HomeSummaryResponse toSummary(HomeLiveState state) {
        return new HomeSummaryResponse(state.getHomeId(), state.getName(), state.getBudgetLimit(),
                state.getAccumulatedCost(), state.budgetUsageRatio(), state.isPenaltyActive(),
                state.isBreachedAt100(), hasAnomaly(state), state.getAppliances().size());
    }

    private HomeStatusResponse toStatus(HomeLiveState state) {
        List<ApplianceStatusResponse> appliances = state.getAppliances().values().stream()
                .map(metric -> new ApplianceStatusResponse(metric.getApplianceId(), metric.getName(),
                        metric.getSafeLimitWatt(), metric.getLastWatt(), metric.getCumulativeWh(),
                        metric.getConsecutiveBreaches(), metric.isAnomalous()))
                .toList();
        return new HomeStatusResponse(state.getHomeId(), state.getName(), state.getContactEmail(),
                state.getBudgetLimit(), state.getAccumulatedCost(), state.getAccumulatedEnergyWh(),
                state.budgetUsageRatio(), state.isPenaltyActive(), state.isWarnedAt80(), state.isBreachedAt100(),
                state.isBreachedAt100(), hasAnomaly(state), appliances);
    }

    private boolean hasAnomaly(HomeLiveState state) {
        return state.getAppliances().values().stream().anyMatch(ApplianceLiveMetric::isAnomalous);
    }

    private ConsumptionHistoryPoint toHistoryPoint(ConsumptionSnapshot snapshot) {
        return new ConsumptionHistoryPoint(snapshot.getSnapshotDay(), snapshot.getRecordedAt(),
                snapshot.getEnergyWh(), snapshot.getCost());
    }
}
