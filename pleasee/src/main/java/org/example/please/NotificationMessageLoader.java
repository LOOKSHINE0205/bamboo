package org.example.please;

import aj.org.objectweb.asm.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Random;
import com.fasterxml.jackson.core.type.TypeReference;



@Component
public class NotificationMessageLoader {
    List<String> messages = objectMapper.readValue(inputStream, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
    private final Random random = new Random();

    public NotificationMessageLoader() {
        loadMessages();
    }

    private void loadMessages() {
        ObjectMapper objectMapper = new ObjectMapper();
        try (InputStream inputStream = getClass().getResourceAsStream("/notification_messages.json")) {
            messages = objectMapper.readValue(inputStream, new TypeReference<List<String>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            // 기본 메시지 설정
            messages = List.of("Default message 1", "Default message 2");
        }
    }

    public String getRandomMessage() {
        return messages.get(random.nextInt(messages.size()));
    }
}
