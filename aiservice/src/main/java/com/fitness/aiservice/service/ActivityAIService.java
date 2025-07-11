package com.fitness.aiservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ActivityAIService {

    @Autowired
    private GeminiService geminiService;

    public Recommendation generateRecommendation(Activity activity){
        String prompt = createPromptForActivity(activity);
        String aiResponse = geminiService.getAnswer(prompt);
        log.info("Response from AI: {}", aiResponse);
        return processAiResponse(activity,aiResponse); 
    }

    private Recommendation processAiResponse(Activity activity,String aiResponse){
        try {
          ObjectMapper mapper=new ObjectMapper(); //To convert json to java objects

          JsonNode rootNode=mapper.readTree(aiResponse);

          JsonNode textNode=rootNode.path("candidates")
                                    .get(0)
                                    .path("content")
                                    .path("parts")
                                    .get(0)
                                    .path("text");

          String jsonContent=textNode.asText()
                                     .replaceAll("```json\\n","")
                                     .replaceAll("\\n```","")
                                     .trim();

          //  log.info("Parsed Response from AI: {}", jsonContent); 

          JsonNode analysisJson=mapper.readTree(jsonContent);
          JsonNode analysisNode=analysisJson.path("analysis");
          StringBuilder fullAnalysis=new StringBuilder();

          addAnalysisSection(fullAnalysis,analysisNode,"overall","Overall:");
          addAnalysisSection(fullAnalysis,analysisNode,"pace","Pace:");
          addAnalysisSection(fullAnalysis,analysisNode,"heartRate","HeartRate:");
          addAnalysisSection(fullAnalysis,analysisNode,"caloriesBurned","CaloriesBurned:");

          List<String> improvements=extractImprovements(analysisJson.path("improvements"));
           List<String> suggestions=extractSuggestions(analysisJson.path("suggestions"));
          List<String> safety=extractSafetyGuideLine(analysisJson.path("safety"));

          return Recommendation.builder()
                              .activityId(activity.getId())
                              .userId(activity.getUserId())
                              .activityType(activity.getType())
                              .recommendation(fullAnalysis.toString().trim())
                              .improvements(improvements)
                              .suggestions(suggestions)
                              .safety(safety)
                              .createdAt(LocalDateTime.now())
                              .build();

        } catch (Exception e) {
          e.printStackTrace();
          // Return a default Recommendation or null in case of error
          return Recommendation.builder()
                  .activityId(activity.getId())
                  .userId(activity.getUserId())
                  .activityType(activity.getType())
                  .recommendation("Could not process AI response.")
                  .improvements(Collections.singletonList("No improvements available"))
                  .suggestions(Collections.singletonList("No suggestions available"))
                  .safety(Collections.singletonList("Follow general safety guidelines"))
                  .createdAt(LocalDateTime.now())
                  .build();
        }
    }

    private List<String> extractSafetyGuideLine(JsonNode safetyNode) {
       
      List<String> safety=new ArrayList<>();

      if(safetyNode.isArray()){
             safetyNode.forEach(item->safety.add(item.asText()));
        }
        
       return safety.isEmpty()?Collections.singletonList("Follow General Safety"):safety;
    }

    private List<String> extractSuggestions(JsonNode suggestionNode) {
         List<String> suggestions=new ArrayList<>();
          if(suggestionNode.isArray()){
             suggestionNode.forEach(suggestion->{
                  String workout=suggestion.path("workout").asText();
                  String description=suggestion.path("description").asText();
                  suggestions.add(String.format("%s:%s",workout,description));
             });
          }

          return suggestions.isEmpty()?
          Collections.singletonList("No specific suggestion is provided"):
                             suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
          List<String> improvements=new ArrayList<>();
          if(improvementsNode.isArray()){
             improvementsNode.forEach(improvement->{
                  String area=improvement.path("area").asText();
                  String detail=improvement.path("recommendation").asText();
                  improvements.add(String.format("%s:%s",area,detail));
             });
          }

          return improvements.isEmpty()?
          Collections.singletonList("No specific improvements is provided"):
                             improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
         
      if(!analysisNode.path(key).isMissingNode()){
         fullAnalysis.append(prefix)
                     .append(analysisNode.path(key).asText())
                     .append("\n\n");
      }
    }

    private String createPromptForActivity(Activity activity) {
        return String.format("""
            Analyze this fitness activity and provide detailed recommendations in the following EXACT JSON format:
            {
              "analysis": {
                "overall": "Overall analysis here",
                "pace": "Pace analysis here",
                "heartRate": "Heart rate analysis here",
                "caloriesBurned": "Calories analysis here"
              },
              "improvements": [
                {
                  "area": "Area name",
                  "recommendation": "Detailed recommendation"
                }
              ],
              "suggestions": [
                {
                  "workout": "Workout name",
                  "description": "Detailed workout description"
                }
              ],
              "safety": [
                "Safety point 1",
                "Safety point 2"
              ]
            }

            Analyze this activity:
            Activity Type: %s
            Duration: %d minutes
            Calories Burned: %d
            Additional Metrics: %s
            
            Provide detailed analysis focusing on performance, improvements, next workout suggestions, and safety guidelines.
            Ensure the response follows the EXACT JSON format shown above.
            """, 
            activity.getType() != null ? activity.getType() : "Unknown",
            activity.getDuration() != null ? activity.getDuration() : 0,
            activity.getCaloriesBurned() != null ? activity.getCaloriesBurned() : 0,
            activity.getAdditionalMetrics() != null ? activity.getAdditionalMetrics().toString() : "None"
        ); 
    }
}