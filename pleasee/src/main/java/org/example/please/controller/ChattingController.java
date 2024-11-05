// ChatController.java
package org.example.please.controller;

import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.example.please.service.ChattingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChattingController {

    @Autowired
    private ChattingService chattingService;

    @PostMapping("/getChatResponse")
    public ResponseEntity<String> getChatResponse(@RequestBody Chatting chatting) {
//        채팅내용 저장 및 답변 사용자에게 전송
        try {
            chattingService.saveChatbotDialogue(chatting);
            String botResponse = chatting.getChatContent();
            return ResponseEntity.ok().body(botResponse);
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버오류");
        }
    }

    @PostMapping("/getUserResponse")
    public ResponseEntity<String> getUserResponse(@RequestBody Chatting chatting) {
//        채팅내용 저장 및 답변 사용자에게 전송
        try {
            chattingService.saveChatbotDialogue(chatting);
            String botResponse = chatting.getChatContent();
            return ResponseEntity.ok().body(botResponse);
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버오류");
        }
    }


    @PostMapping("/create_room")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Chatbot chatbot) {
        Map<String, Object> response = new HashMap<>();
        chattingService.createRoom(chatbot);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
