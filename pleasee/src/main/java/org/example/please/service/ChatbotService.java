package org.example.please.service;

import org.example.please.entity.Chatbot;
import org.example.please.entity.Feedback;
import org.example.please.repository.ChatbotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatbotService {

    @Autowired
    private ChatbotRepository chatbotRepository;

    public void createRoom(Chatbot chatbot) {
        chatbotRepository.save(chatbot);
    }

}
