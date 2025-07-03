package com.fitness.activityservice.dto;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fitness.activityservice.model.ActivityType;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ActivityResponse {

     private String id;
    private String userId;
    private ActivityType type;
    private Integer duration;
    private Integer caloriesBurned;
    private LocalDateTime startTime;
    private Map<String,Object> additionalMetrices;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
