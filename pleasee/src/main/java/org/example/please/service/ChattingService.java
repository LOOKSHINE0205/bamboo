package org.example.please.service;

import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.example.please.repository.ChatbotRepository;
import org.example.please.repository.ChattingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChattingService {

    @Autowired
    private ChatbotRepository chatbotRepository;
    @Autowired
    private ChattingRepository chattingRepository;
// 채팅방형성
    public void createRoom(Chatbot chatbot) {
        chatbotRepository.save(chatbot);
    }
//    챗봇 답변내용 저장
    public void saveChatbotDialogue(Chatting chatting) {
        chattingRepository.save(chatting);
    }


}
