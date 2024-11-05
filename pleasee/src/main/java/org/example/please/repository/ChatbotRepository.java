package org.example.please.repository;

import org.example.please.entity.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotRepository extends JpaRepository<Chatbot, Integer> {

}
