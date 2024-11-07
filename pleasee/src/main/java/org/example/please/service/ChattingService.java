package org.example.please.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.example.please.repository.ChatbotRepository;
import org.example.please.repository.ChattingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Chatting saveChatbotDialogue(Chatting chatting) {
        System.out.println("Saving chatbot dialogue in a new transaction.");
        chattingRepository.saveAndFlush(chatting);
        System.out.println("Chatbot dialogue saved successfully.");
        return chatting;
    }


    public Chatbot findByUserEmail(String userEmail) {
        return chatbotRepository.findByUserEmail(userEmail);
    }

    @Transactional(readOnly = true)
    public List<Chatting> getChatHistory(int croomIdx) {
        return chatbotRepository.findByCroomIdxOrderByCreatedAtAsc(croomIdx);
    }

    @Transactional
    public int updateEvaluation(int chatIdx, String newEvaluation) {
        Chatting existingChatting = findById(chatIdx);

        if (existingChatting != null) {
            // 기존 평가와 같으면 null 처리
            String evaluationToUpdate = existingChatting.getEvaluation() != null &&
                    existingChatting.getEvaluation().equals(newEvaluation) ? null : newEvaluation;

            return chattingRepository.updateEvaluationByChatIdx(chatIdx, evaluationToUpdate);
        }
        return 0;
    }

    public Chatting findById(int chatIdx) {
        return chattingRepository.findByChatIdx(chatIdx);
    }

}
