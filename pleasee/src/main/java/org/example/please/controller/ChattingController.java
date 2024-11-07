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
    public ResponseEntity<String> getChatResponse(@RequestBody Chatting chatting) {
//        채팅내용 저장 및 답변 사용자에게 전송
        LocalDateTime now = LocalDateTime.now();
        try {
//            System.out.println("1. Received request to process chat response.");
//            요청이온 CroomIdx의 가장 최신의 레코드 확인
            Chatting latestChatting = chattingRepository.findLatestChatByCroomIdx(chatting.getCroomIdx());
            if (latestChatting != null) {
//                System.out.println("2. Latest chat record found for CroomIdx: " + chatting.getCroomIdx());
                LocalDateTime latestCreatedAt = latestChatting.getCreatedAt().toLocalDateTime();
// 마지막세션 얻고
                chatting.setSessionIdx(latestChatting.getSessionIdx());
//                System.out.println("   - Latest session index: " + latestChatting.getSessionIdx());
//                더하고
                if (Duration.between(latestCreatedAt, now).toMinutes() > 30) {
                    chatting.setSessionIdx(latestChatting.getSessionIdx() + 1);
//                    System.out.println("   - More than 30 minutes passed. Incrementing session index to: " + chatting.getSessionIdx());
                }
            } else {
                // latestChatting이 null일 경우 그대로 insert 진행
                chatting.setSessionIdx(1);
//                System.out.println("No previous chat record found. Proceeding with insertion.");
            }
            if (chatting.getChatter().equals("user")) {
//                System.out.println("3. Saving user chat message.");
                chattingService.saveChatbotDialogue(chatting);
                entityManager.flush(); // 현재까지의 상태를 DB에 동기화
                entityManager.clear(); // 세션 초기화
//                System.out.println("   - User chat message saved and session cleared.");
            }
//오오오오오오오오오옹 채솞연결하기 setEmotionTag, setChatContent 등
            String botMessage = "답변입니다";
//            System.out.println("4. Saving bot response message.");
            saveBotMessage(chatting.getCroomIdx(), chatting.getSessionIdx(), botMessage, "happy");

            return ResponseEntity.ok().body(botMessage);

        }catch (Exception e) {
            e.printStackTrace(); // 예외 발생 시 디버그 용도로 스택 추적 출력
            System.out.println("Error occurred while processing chat response.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버오류");
        }
    }

    public void saveBotMessage(int croomIdx, int sessionIdx, String content, String emotionTag) {
        Chatting botResponseChatting = new Chatting();
        botResponseChatting.setCroomIdx(croomIdx);
        botResponseChatting.setSessionIdx(sessionIdx);
        botResponseChatting.setChatter("bot");
        botResponseChatting.setChatContent(content);
        botResponseChatting.setEmotionTag(emotionTag);
        botResponseChatting.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        try {
            System.out.println("   - Attempting to save bot message.");
            chattingService.saveChatbotDialogue(botResponseChatting);
            entityManager.flush(); // DB 동기화
            entityManager.clear(); // 세션 초기화
            System.out.println("   - Bot message saved successfully and session cleared.");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error occurred while saving bot message.");
        }
//    }
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
}

