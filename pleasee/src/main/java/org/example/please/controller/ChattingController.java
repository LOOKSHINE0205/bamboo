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
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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
    private RestTemplate restTemplate;

    @Autowired
    private ChattingService chattingService;

    @Autowired
    private ChattingRepository chattingRepository;

    @PostMapping("/sendUserMessage")
    public ResponseEntity<Map<String, Object>> sendUserMessage(String userEmail, int croomIdx, int sessionIdx, String chatContent) {
        Map<String, Object> response = new HashMap<>();

        String url = "https://4103-35-231-206-55.ngrok-free.app/predict";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            // 필요한 데이터 준비
            String firstUserMessage = chattingService.getFirstUserMessageInSession(croomIdx, sessionIdx);
            String previousMessage = chattingService.getLatestMessageInRoom(croomIdx, sessionIdx);

            // 요청에 필요한 데이터 구성
            response.put("user_email", userEmail);
            response.put("croom_idx", croomIdx);
            response.put("session_idx", sessionIdx);
            response.put("first_user_message", firstUserMessage);
            response.put("previous_message", previousMessage);
            response.put("current_user_message", chatContent);

            // HTTP 엔터티 생성
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(response, headers);

            // ngrok 서버에 POST 요청을 보내고 응답 받기
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, requestEntity, Map.class);

            // ngrok에서 받은 응답 데이터 가져오기
            Map<String, Object> responseBody = responseEntity.getBody();

            // 응답 데이터를 출력하거나 필요한 경우 로직에 사용
            System.out.println("Received from ngrok: " + responseBody);

            // ngrok에서 받은 응답을 클라이언트에 반환
            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("error", "An error occurred while processing the message.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


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
            //            모델한테 보낼거
//            Map<String,Object> sendUserMessage(chatting.getUserEmail(),chatting.getCroomIdx(),chatting.getSessionIdx(), chatting.getChatContent());

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

