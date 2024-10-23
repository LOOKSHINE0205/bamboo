// ChatController.java
package org.example.please.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @PostMapping("/message")
    public String getChatResponse(@RequestBody String message) {
        // 간단한 챗봇 응답 로직 예시
        return  message;
    }
}
