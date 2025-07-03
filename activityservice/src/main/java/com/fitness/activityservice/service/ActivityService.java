package com.fitness.activityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.repo.ActivityRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

@Service
@Slf4j
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserValidationService userValidationService;

    @Autowired
    private RabbitTemplate rabbitTemplate; 

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routing;
   
    public ActivityResponse trackActivity(ActivityRequest request) {
         boolean isValidUser=userValidationService.validateUser(request.getUserId());

        if(!isValidUser){
            throw new RuntimeException("Invalid User: "+request.getUserId());
        }
        Activity activity=Activity.builder()
                            .userId(request.getUserId())
                            .type(request.getType())
                            .duration(request.getDuration())
                            .caloriesBurned(request.getCaloriesBurned())
                            .startTime(request.getStartTime())
                            .additionalMetrices(request.getAdditionalMetrices())
                            .build();
        
        Activity savedActivity=activityRepository.save(activity);

        //Publish to RabbitMq for AI processing

        try {
            rabbitTemplate.convertAndSend(exchange, routing, savedActivity);
        } catch (Exception e) {
           log.error("Failed to publish activity to RabbitMq",e);
        }

        return mapToResponse(savedActivity);
    }

    private ActivityResponse mapToResponse(Activity activity){
        ActivityResponse response=ActivityResponse.builder()
                                    .id(activity.getId())
                                    .userId(activity.getUserId())
                                    .type(activity.getType())
                                    .duration(activity.getDuration())
                                    .caloriesBurned(activity.getCaloriesBurned())
                                    .startTime(activity.getStartTime())
                                    .additionalMetrices(activity.getAdditionalMetrices())
                                    .createdAt(activity.getCreatedAt())
                                    .updatedAt(activity.getUpdatedAt())
                                    .build();

        return response;
    }

    public List<ActivityResponse> getUserActivities(String userId) {
       List<Activity> activities=activityRepository.findByUserId(userId);
       return activities.stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(String activityId) {
       return activityRepository.findById(activityId)
                              .map(this::mapToResponse)
                              .orElseThrow(()->new RuntimeException("Activity id is not found "+activityId));
    }

}
