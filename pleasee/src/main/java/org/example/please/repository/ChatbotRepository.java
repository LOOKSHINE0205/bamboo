package org.example.please.repository;

import org.example.please.entity.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ChatbotRepository extends JpaRepository<Chatbot, Integer> {

    Chatbot findByUserEmail(String userEmail);
}
