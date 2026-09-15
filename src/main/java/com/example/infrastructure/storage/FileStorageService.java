package com.example.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final Path uploadDirectory;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDirectory) {
        this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();

        try {
            if (Files.notExists(this.uploadDirectory)) {
                Files.createDirectories(this.uploadDirectory);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String store(MultipartFile file, StorageDirectory storageDirectory) {
        validate(file);

        Path directoryPath = uploadDirectory.resolve(storageDirectory.getPath()).normalize();

        if (!directoryPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid storage directory");
        }

        try {
            Files.createDirectories(directoryPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory", e);
        }

        String extension = getExtension(file);
        String filename = UUID.randomUUID() + extension;
        Path targetPath = directoryPath.resolve(filename).normalize();

        if (!targetPath.startsWith(directoryPath)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        try {
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not store image", e);
        }

        return "/uploads/" + storageDirectory.getPath() + File.separator + filename;
    }

    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String relativePath = fileUrl.replaceFirst("^/uploads/", "");

        Path targetPath = uploadDirectory.resolve(relativePath).normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Product image is required");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG and WebP images are allowed");
        }
    }

    private String getExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("Image file must have an extension");
        }

        String extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

        return switch (extension) {
            case ".jpg", ".jpeg", ".webp", ".png" -> extension;
            default -> throw new IllegalArgumentException("Unsupported image extension");
        };
    }
}