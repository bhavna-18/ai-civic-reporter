
package com.aicivicreporter.controller;

import com.aicivicreporter.dto.AiVerificationResult;
import com.aicivicreporter.service.AiVerificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-verification")
@CrossOrigin
public class AiVerificationController {

    private final AiVerificationService aiVerificationService;

    public AiVerificationController(
            AiVerificationService aiVerificationService) {

        this.aiVerificationService = aiVerificationService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeImage(
            @RequestBody Map<String, String> request) {

        try {

            String fileName = request.get("fileName");

            if (fileName == null || fileName.isBlank()) {

                return ResponseEntity.badRequest()
                        .body("Evidence file name is required.");
            }

            AiVerificationResult result =
                    aiVerificationService.analyzeImage(fileName);

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put("success", true);
            response.put("message",
                    "AI verification completed successfully.");

            response.put("result", result);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (IllegalStateException e) {

            return ResponseEntity.internalServerError()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                        "AI verification failed: "
                        + e.getMessage()
                    );
        }
    }
}