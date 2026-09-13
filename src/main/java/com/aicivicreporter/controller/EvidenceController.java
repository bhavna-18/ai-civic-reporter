package com.aicivicreporter.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    // Evidence upload folder
    private final Path uploadDirectory =
            Paths.get("uploads", "evidence")
                 .toAbsolutePath()
                 .normalize();

    // Maximum file size = 20 MB
    private static final long MAX_FILE_SIZE =
            20 * 1024 * 1024;

    // Allowed file types
    private static final Set<String> ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "video/mp4"
            );

    @PostMapping("/upload")
    public ResponseEntity<?> uploadEvidence(
            @RequestParam("file") MultipartFile file) {

        try {

            // Check file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please select a file.");
            }

            // Check size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body("File size must be less than 20 MB.");
            }

            // Check type
            String contentType = file.getContentType();

            if (contentType == null ||
                    !ALLOWED_TYPES.contains(
                            contentType.toLowerCase())) {

                return ResponseEntity.badRequest()
                        .body(
                            "Invalid file type. " +
                            "Only JPG, JPEG, PNG, WEBP and MP4 are allowed."
                        );
            }

            // Create folder automatically
            Files.createDirectories(uploadDirectory);

            // Original filename
            String originalName =
                    file.getOriginalFilename();

            // Get extension
            String extension = "";

            if (originalName != null &&
                    originalName.contains(".")) {

                extension =
                        originalName
                                .substring(
                                    originalName.lastIndexOf(".")
                                )
                                .toLowerCase();
            }

            // Generate unique filename
            String storedFileName =
                    UUID.randomUUID().toString()
                    + extension;

            // Final destination
            Path destination =
                    uploadDirectory.resolve(storedFileName);

            // Save file
            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Response
            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "message",
                    "Evidence uploaded successfully"
            );

            response.put(
                    "originalFileName",
                    originalName
            );

            response.put(
                    "storedFileName",
                    storedFileName
            );

            response.put(
                    "fileUrl",
                    "/uploads/evidence/" + storedFileName
            );

            response.put(
                    "fileType",
                    contentType
            );

            response.put(
                    "fileSize",
                    file.getSize()
            );

            return ResponseEntity.ok(response);

        } catch (IOException e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Failed to save evidence: "
                        + e.getMessage()
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Evidence upload failed: "
                        + e.getMessage()
                    );
        }
    }
}