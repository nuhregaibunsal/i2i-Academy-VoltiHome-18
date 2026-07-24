package com.voltwise.core.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ApplianceRequest(
        @NotBlank(message = "appliance name is required") String name,
        @Positive(message = "safeLimitWatt must be positive") double safeLimitWatt,
        @Positive(message = "nominalWatt must be positive") double nominalWatt) {
}
