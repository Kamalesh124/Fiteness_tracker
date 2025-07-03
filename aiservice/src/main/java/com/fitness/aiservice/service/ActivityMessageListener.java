package com.fitness.aiservice.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ActivityMessageListener {

    @Autowired
    private RecommendationRepository repo;

    @Autowired
    private ActivityAIService activityAIService;

    @RabbitListener(queues = "activity.queue")
    public void processActivity(Activity activity){
        log.info("Recieved activity for processing:{}",activity.getId());
        //log.info("Generated Recommendation:{}",activityAIService.generateRecommendation(activity));

        Recommendation recommendation=activityAIService.generateRecommendation(activity);
        repo.save(recommendation);
    }
}
