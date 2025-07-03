package com.fitness.aiservice.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

import io.github.cdimascio.dotenv.Dotenv;

@Service
public class GeminiService {
    /*

    @Autowired
    private Dotenv dotenv;
     
    private  final WebClient webClient;

    public GeminiService(WebClient.Builder webClientBuilder){
        this.webClient=webClientBuilder.build();
    }

    public String getAnswer(String question){

        String apiKey = dotenv.get("GEMINI_API_KEY");
        String apiUrl = dotenv.get("GEMINI_API_URL");

        Map<String,Object> requestBody=Map.of(
            "contents",new Object[]{
                Map.of("parts",new Object[]{
                    Map.of("text",question)
                })
            }
        );

       try{
          String response = webClient.post()
                            .uri(apiUrl+apiKey)
                            .header("Content-Type","application/json")
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

          return response;
                              
       }
       catch(Exception e){
         throw new RuntimeException("Error calling gemini api"+e.getMessage());
       }
    }*/

   
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    @Value("${gemini.api.key}")
    private String apiKey;

    private  final WebClient webClient;

    public GeminiService(WebClient.Builder webClientBuilder){
        this.webClient=webClientBuilder.build();
    }
    
    public String getAnswer(String question) {
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", question)
                })
            }
        );
        
        try {
            String response = webClient.post()
                    .uri(apiUrl + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }
    
}
