package com.voltwise.core.home.web;

import com.voltwise.core.home.dto.ConsumerLoginRequest;
import com.voltwise.core.home.dto.ConsumerLoginResponse;
import com.voltwise.core.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Resident authentication endpoints")
public class AuthController {

    private final HomeService homeService;

    public AuthController(HomeService homeService) {
        this.homeService = homeService;
    }

    @PostMapping("/consumer-login")
    @Operation(summary = "Authenticate a resident with the home contact email and password")
    public ConsumerLoginResponse consumerLogin(@Valid @RequestBody ConsumerLoginRequest request) {
        return homeService.consumerLogin(request);
    }
}
