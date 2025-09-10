package com.fitness.userservice.Controller;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.service.KeycloakAdminClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/keycloak")
public class KeycloakUserController {

    @Autowired
    private KeycloakAdminClientService keycloakAdminClientService;

    @PostMapping("/register")
    public ResponseEntity<String> registerInKeycloak(@Valid @RequestBody RegisterRequest request) {
        try {
            keycloakAdminClientService.createUserInKeycloak(request);
            return ResponseEntity.ok("User registered in Keycloak");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
