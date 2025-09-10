package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;

@Service
@Slf4j
public class KeycloakAdminClientService {

    @Value("${keycloak.auth-server-url}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    @Value("${keycloak.resource}")
    private String clientId;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        restTemplate = new RestTemplate();
    }

    public void createUserInKeycloak(RegisterRequest request) throws Exception {
    String accessToken = getAdminAccessToken();

 
    Map<String, Object> user = new HashMap<>();
    user.put("enabled", true);
    user.put("username", request.getUsername());
    user.put("firstName", request.getFirstName());
    user.put("lastName", request.getLastName());
    user.put("email", request.getEmail());

    
    Map<String, Object> credentials = new HashMap<>();
    credentials.put("type", "password");
    credentials.put("value", request.getPassword());
    credentials.put("temporary", false);

    user.put("credentials", List.of(credentials));

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);

    String createUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users";

    ResponseEntity<Void> response = restTemplate.exchange(
            createUserUrl,
            HttpMethod.POST,
            entity,
            Void.class
    );

    if (response.getStatusCode().is2xxSuccessful() || response.getStatusCode().value() == 201) {
        String locationHeader = response.getHeaders().getFirst("Location");
        if (locationHeader != null) {
           
            String keycloakId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);
            log.info(" Keycloak user ID: {}", keycloakId);

            
            request.setKeycloakId(keycloakId);
        }

        log.info(" User created in Keycloak: {}", request.getUsername());
    } else {
        throw new RuntimeException(" Failed to create user in Keycloak: " + response.getStatusCode());
    }
}

    private String getAdminAccessToken() throws Exception {
        String tokenUrl = keycloakServerUrl + "/realms/master/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

     
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "password");
        formData.add("client_id", clientId);
        formData.add("username", adminUsername);
        formData.add("password", adminPassword);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("access_token");
        } else {
            throw new RuntimeException(" Failed to get access token from Keycloak");
        }
    }
}
