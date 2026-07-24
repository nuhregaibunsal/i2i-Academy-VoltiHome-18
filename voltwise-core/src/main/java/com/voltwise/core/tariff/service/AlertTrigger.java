package com.voltwise.core.tariff.service;

import com.voltwise.core.home.domain.EventType;

public record AlertTrigger(EventType type, String detail, boolean notifiable) {

    public static AlertTrigger notifiable(EventType type, String detail) {
        return new AlertTrigger(type, detail, true);
    }

    public static AlertTrigger silent(EventType type, String detail) {
        return new AlertTrigger(type, detail, false);
    }
}
