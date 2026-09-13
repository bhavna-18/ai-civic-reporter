package com.aicivicreporter.controller;

import com.aicivicreporter.model.User;
import com.aicivicreporter.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==============================
    // REGISTER USER
    // ==============================

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        try {

            // Check whether email already exists
            Optional<User> existingUser =
                    userRepository.findByEmail(user.getEmail());

            if (existingUser.isPresent()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email already registered");

            }

            // Default role = CITIZEN
            if (user.getRole() == null ||
                    user.getRole().trim().isEmpty()) {

                user.setRole("CITIZEN");
            }

            User savedUser =
                    userRepository.save(user);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Registration failed: " + e.getMessage());
        }
    }


    // ==============================
    // LOGIN USER
    // ==============================

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @RequestBody User loginData) {

        try {

            Optional<User> userOptional =
                    userRepository.findByEmail(
                            loginData.getEmail()
                    );

            if (userOptional.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Invalid email or password");
            }

            User user =
                    userOptional.get();


            // Check password
            if (!user.getPassword()
                    .equals(loginData.getPassword())) {

                return ResponseEntity
                        .badRequest()
                        .body("Invalid email or password");
            }


            return ResponseEntity.ok(user);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Login failed: " + e.getMessage());
        }
    }
}