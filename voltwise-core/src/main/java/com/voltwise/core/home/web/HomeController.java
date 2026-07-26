package com.voltwise.core.home.web;

import com.voltwise.core.home.dto.ConsumptionHistoryPoint;
import com.voltwise.core.home.dto.HomeRegisteredResponse;
import com.voltwise.core.home.dto.HomeStatusResponse;
import com.voltwise.core.home.dto.HomeSummaryResponse;
import com.voltwise.core.home.dto.RecommendationResponse;
import com.voltwise.core.home.dto.RegisterHomeRequest;
import com.voltwise.core.common.web.PagedResponse;
import com.voltwise.core.home.dto.ApplianceRequest;
import com.voltwise.core.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/homes")
@Tag(name = "Homes", description = "Residential registration and live monitoring endpoints")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @PostMapping
    @Operation(summary = "Register a new home along with its appliance topology")
    public ResponseEntity<HomeRegisteredResponse> register(@Valid @RequestBody RegisterHomeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homeService.register(request));
    }

    @GetMapping
    @Operation(summary = "List live summaries of all registered homes from the in-memory grid")
    public List<HomeSummaryResponse> list() {
        return homeService.listSummaries();
    }

    @GetMapping("/{homeId}/status")
    @Operation(summary = "Get the real-time status of a home and its appliances from Apache Ignite")
    public HomeStatusResponse status(@PathVariable Long homeId) {
        return homeService.getStatus(homeId);
    }

    @GetMapping("/{homeId}/history")
    @Operation(summary = "Get the paginated consumption history of a home from PostgreSQL (newest first)")
    public PagedResponse<ConsumptionHistoryPoint> history(@PathVariable Long homeId,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "100") int size,
                                                          @RequestParam(required = false) String from,
                                                          @RequestParam(required = false) String to) {
        return homeService.getHistory(homeId, page, size, parseInstant(from), parseInstant(to));
    }

    private java.time.Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return java.time.Instant.parse(value);
        } catch (Exception ex) {
            return null;
        }
    }

    @GetMapping("/{homeId}/recommendations")
    @Operation(summary = "Get the paginated AI advisory history of a home from PostgreSQL (newest first)")
    public PagedResponse<RecommendationResponse> recommendations(@PathVariable Long homeId,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "20") int size) {
        return homeService.getRecommendations(homeId, page, size);
    }

    @PostMapping("/{homeId}/appliances")
    @Operation(summary = "Add an appliance to an existing home and re-sync the simulation")
    public HomeStatusResponse addAppliance(@PathVariable Long homeId, @Valid @RequestBody ApplianceRequest request) {
        return homeService.addAppliance(homeId, request);
    }

    @DeleteMapping("/{homeId}/appliances/{applianceId}")
    @Operation(summary = "Remove an appliance from a home and re-sync the simulation")
    public HomeStatusResponse removeAppliance(@PathVariable Long homeId, @PathVariable Long applianceId) {
        return homeService.removeAppliance(homeId, applianceId);
    }
}
