package com.fitness.userservice.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User does not exist"));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername()) 
                .password(user.getPassword())
                .keycloakId(user.getKeycloakId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserResponse register(RegisterRequest request) throws Exception {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // Update keycloakId and username if needed
            if ((existingUser.getKeycloakId() == null || existingUser.getKeycloakId().isEmpty())
                    && request.getKeycloakId() != null && !request.getKeycloakId().isEmpty()) {
                existingUser.setKeycloakId(request.getKeycloakId());
            }

            if ((existingUser.getUsername() == null || existingUser.getUsername().isEmpty())
                    && request.getUsername() != null && !request.getUsername().isEmpty()) {
                existingUser.setUsername(request.getUsername());
            }

            userRepository.save(existingUser);

            return UserResponse.builder()
                    .id(existingUser.getId())
                    .email(existingUser.getEmail())
                    .username(existingUser.getUsername()) 
                    .password(existingUser.getPassword())
                    .keycloakId(existingUser.getKeycloakId())
                    .firstName(existingUser.getFirstName())
                    .lastName(existingUser.getLastName())
                    .createdAt(existingUser.getCreatedAt())
                    .updatedAt(existingUser.getUpdatedAt())
                    .build();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername()); 
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setKeycloakId(request.getKeycloakId());

        User saved = userRepository.save(user);

        return UserResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .username(saved.getUsername()) 
                .password(saved.getPassword())
                .keycloakId(saved.getKeycloakId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    public Boolean existByUserId(String userId) {
        log.info("Calling User Validation API: {}", userId);
        return userRepository.existsByKeycloakId(userId);
    }
}
