package org.example.please.repository;

import jakarta.transaction.Transactional;
import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    // 단순 이메일체크
    boolean existsByUserEmail(String userEmail);
    // 해당 이메일로 사용자 정보를 조회할때 유용함.
   Optional<User> findByUserEmail(String userEmail);
        @Transactional
        @Modifying
        @Query("UPDATE User u SET u.chatbotLevel = :newLevel WHERE u.userEmail = :email")
        void updateChatbotLevel(@Param("email") String email, @Param("newLevel") int newLevel);



    // 관리자 메서드들
    // 전체 사용자 수 카운트
    @Query("SELECT COUNT(u) FROM User u")
    long countTotalUsers();

    // 오늘 활동한 사용자 수 카운트
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u WHERE u.userEmail IN " +
            "(SELECT DISTINCT c.userEmail FROM Chatting c WHERE DATE(c.createdAt) = CURRENT_DATE) " +
            "OR u.userEmail IN " +
            "(SELECT DISTINCT d.userEmail FROM Diary d WHERE DATE(d.createdAt) = CURRENT_DATE)")
    long countActiveUsersToday();
}
