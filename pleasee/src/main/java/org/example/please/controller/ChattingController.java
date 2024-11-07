// ChatController.java
package org.example.please.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.example.please.repository.ChattingRepository;
import org.example.please.service.ChattingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChattingController {

    @PersistenceContext
    private EntityManager entityManager; // EntityManager 주입

    @Autowired
    private ChattingService chattingService;

    @Autowired
    private ChattingRepository chattingRepository;

    @Transactional
    @PostMapping("/getChatResponse")
    public ResponseEntity<Map<String, Object>> getChatResponse(@RequestBody Chatting chatting) {
        LocalDateTime now = LocalDateTime.now();
        try {
            // 최신 채팅 기록 조회 및 세션 인덱스 설정
            Chatting latestChatting = chattingRepository.findLatestChatByCroomIdx(chatting.getCroomIdx());
            if (latestChatting != null) {
                LocalDateTime latestCreatedAt = latestChatting.getCreatedAt().toLocalDateTime();
                chatting.setSessionIdx(latestChatting.getSessionIdx());

                if (Duration.between(latestCreatedAt, now).toMinutes() > 30) {
                    chatting.setSessionIdx(latestChatting.getSessionIdx() + 1);
                }
            } else {
                chatting.setSessionIdx(1);
            }

            // 사용자 메시지 저장
            if ("user".equals(chatting.getChatter())) {
                chattingService.saveChatbotDialogue(chatting);

                entityManager.flush();
                entityManager.clear();
                System.out.println("userChatIdxxxx"+chattingService.saveChatbotDialogue(chatting));
            }

            // 봇 응답 생성 및 저장
            String botMessage = "답변입니다";
            Chatting botResponse = saveBotMessage(chatting.getCroomIdx(), chatting.getSessionIdx(), botMessage, "happy");

            // 응답 데이터 생성
            Map<String, Object> response = new HashMap<>();
            response.put("chatContent", botResponse.getChatContent());
            response.put("chatIdx", botResponse.getChatIdx()); // 저장된 chatIdx 반환
            response.put("evaluation", botResponse.getEvaluation());

            System.out.println("Returning chatIdx: " + botResponse.getChatIdx()); // 디버그 로그

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error occurred while processing chat response.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private Chatting saveBotMessage(int croomIdx, int sessionIdx, String content, String emotionTag) {
        Chatting botMessage = new Chatting();
        botMessage.setCroomIdx(croomIdx);
        botMessage.setSessionIdx(sessionIdx);
        botMessage.setChatContent(content);
        botMessage.setChatter("bot");
        botMessage.setEmotionTag(emotionTag);


        Chatting savedMessage = chattingRepository.saveAndFlush(botMessage);
        System.out.println("chatIDXXXXXX: " + savedMessage.getChatIdx());
        // 저장 후, 데이터베이스에서 다시 조회하여 반환 (생성된 chatIdx 포함)
        return chattingRepository.findById(savedMessage.getChatIdx())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved bot message"));
    }



    @PostMapping("/create_room")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Chatbot chatbot) {
        Map<String, Object> response = new HashMap<>();
        chattingService.createRoom(chatbot);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/getChatHistory")
    public ResponseEntity<List<Chatting>> getChatHisotry(@RequestParam Integer croomIdx) {
        // 특정 방 ID의 채팅 기록을 가져옴
        List<Chatting> chatHistory = chattingService.getChatHistory(croomIdx);
        return ResponseEntity.ok(chatHistory);
    }
    @PutMapping("/updateEvaluation")
    public ResponseEntity<String> updateEvaluation(@RequestBody Chatting chatting) {
        int rowsUpdated = chattingService.updateEvaluation(chatting.getChatIdx(), chatting.getEvaluation());
        if (rowsUpdated > 0) {
            return ResponseEntity.ok("평가완료");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat message not found");
        }
    }
    }

