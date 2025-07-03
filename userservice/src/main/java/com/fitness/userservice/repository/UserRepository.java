package com.fitness.userservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fitness.userservice.model.User;

@Repository
public interface UserRepository extends JpaRepository<User,String>{

   Optional<User> findByEmail(String email);

   Boolean existsByKeycloakId(String userId);
}
