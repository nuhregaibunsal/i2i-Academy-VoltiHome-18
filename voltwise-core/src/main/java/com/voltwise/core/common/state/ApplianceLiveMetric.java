package com.voltwise.core.common.state;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplianceLiveMetric implements Serializable {

    private Long applianceId;
    private String name;
    private double safeLimitWatt;
    private double lastWatt;
    private double cumulativeWh;
    private int consecutiveBreaches;
    private boolean anomalous;
}
