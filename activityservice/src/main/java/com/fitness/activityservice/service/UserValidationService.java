package com.fitness.activityservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class UserValidationService {

    @Autowired
    private  WebClient userServiceWebClient;

    public boolean validateUser(String userId){
         log.info("Calling User Validation API:{}",userId);
      try {
         return userServiceWebClient.get()
                               .uri("/api/users/{userId}/validate",userId)
                               .retrieve()
                               .bodyToMono(Boolean.class)
                               .block();
      } catch (Exception e) {
          throw new RuntimeException("Invalid request or not available user: "+userId);
      }
       
    }

}
