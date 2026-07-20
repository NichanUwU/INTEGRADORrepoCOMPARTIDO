package com.sofi.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class JsonFallbackData {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonFallbackData() {
    }

    public static List<Map<String, Object>> readList(String fileName) {
        Path[] candidates = {
                Paths.get("json", fileName),
                Paths.get("..", "json", fileName),
                Paths.get("sofi-backend", "json", fileName),
                Paths.get("..", "sofi-backend", "json", fileName)
        };

        for (Path candidate : candidates) {
            if (Files.exists(candidate)) {
                try {
                    return MAPPER.readValue(candidate.toFile(), new TypeReference<List<Map<String, Object>>>() {
                    });
                } catch (IOException ignored) {
                }
            }
        }

        return Collections.emptyList();
    }
}
