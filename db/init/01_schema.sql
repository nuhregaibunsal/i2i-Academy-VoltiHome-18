CREATE TABLE IF NOT EXISTS home (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255)      NOT NULL,
    contact_email     VARCHAR(255)      NOT NULL,
    password_hash     VARCHAR(255)      NOT NULL,
    budget_limit      DOUBLE PRECISION  NOT NULL,
    base_rate_per_kwh DOUBLE PRECISION  NOT NULL,
    accumulated_cost  DOUBLE PRECISION  NOT NULL DEFAULT 0,
    penalty_active    BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appliance (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255)     NOT NULL,
    safe_limit_watt DOUBLE PRECISION NOT NULL,
    nominal_watt    DOUBLE PRECISION NOT NULL,
    home_id         BIGINT           NOT NULL,
    CONSTRAINT fk_appliance_home FOREIGN KEY (home_id) REFERENCES home (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consumption_snapshot (
    id           BIGSERIAL PRIMARY KEY,
    home_id      BIGINT           NOT NULL,
    snapshot_day DATE             NOT NULL,
    energy_wh    DOUBLE PRECISION NOT NULL,
    cost         DOUBLE PRECISION NOT NULL,
    recorded_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_snapshot_home FOREIGN KEY (home_id) REFERENCES home (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_log (
    id          BIGSERIAL PRIMARY KEY,
    home_id     BIGINT       NOT NULL,
    event_type  VARCHAR(64)  NOT NULL,
    detail      VARCHAR(512) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_event_home FOREIGN KEY (home_id) REFERENCES home (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_recommendation (
    id             BIGSERIAL PRIMARY KEY,
    home_id        BIGINT       NOT NULL,
    trigger_reason VARCHAR(255) NOT NULL,
    content        TEXT         NOT NULL,
    delivered      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_recommendation_home FOREIGN KEY (home_id) REFERENCES home (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_appliance_home ON appliance (home_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_home_recorded ON consumption_snapshot (home_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_event_home_occurred ON event_log (home_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_home_created ON ai_recommendation (home_id, created_at);

CREATE TABLE IF NOT EXISTS notification (
    id         BIGSERIAL PRIMARY KEY,
    home_id    BIGINT       NOT NULL,
    home_name  VARCHAR(255) NOT NULL,
    type       VARCHAR(64)  NOT NULL,
    message    VARCHAR(512) NOT NULL,
    read_flag  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_notification_home FOREIGN KEY (home_id) REFERENCES home (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_created ON notification (created_at);
CREATE INDEX IF NOT EXISTS idx_notification_home_created ON notification (home_id, created_at);
