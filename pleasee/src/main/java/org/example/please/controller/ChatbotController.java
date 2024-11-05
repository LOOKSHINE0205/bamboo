// ChatController.java
package org.example.please.controller;

import org.example.please.entity.Chatbot;
import org.example.please.entity.Feedback;
import org.example.please.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public String getChatResponse(@RequestBody String message) {
        // 간단한 챗봇 응답 로직 예시
        return  message;
    }

    @PostMapping("/create_room")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Chatbot chatbot) {
        Map<String, Object> response = new HashMap<>();
        chatbotService.createRoom(chatbot);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
