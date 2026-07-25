package com.voltwise.core.home.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ConsumerLoginRequest(
        @NotBlank @Email(message = "a valid email is required") String email,
        @NotBlank(message = "password is required") String password) {
}
