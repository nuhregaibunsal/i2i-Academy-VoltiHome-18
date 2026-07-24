package com.voltwise.core.home.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record RegisterHomeRequest(
        @NotBlank(message = "home name is required") String name,
        @NotBlank @Email(message = "a valid contact email is required") String contactEmail,
        @Positive(message = "budgetLimit must be positive") double budgetLimit,
        @Positive(message = "baseRatePerKwh must be positive") double baseRatePerKwh,
        @NotEmpty(message = "at least one appliance is required") @Valid List<ApplianceRequest> appliances) {
}
