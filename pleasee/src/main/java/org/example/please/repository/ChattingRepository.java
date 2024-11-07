package org.example.please.repository;

import jakarta.transaction.Transactional;
import org.example.please.entity.Chatting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;


public interface ChattingRepository extends JpaRepository<Chatting, Integer> {

    @Query(value = "SELECT * FROM chatting_tb WHERE croom_idx = ?1 ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Chatting findLatestChatByCroomIdx(int croomIdx);

    @Modifying
    @Transactional
    @Query("UPDATE Chatting c SET c.evaluation = :evaluation WHERE c.chatIdx = :chatIdx")
    int updateEvaluationByChatIdx(int chatIdx, String evaluation);
}
