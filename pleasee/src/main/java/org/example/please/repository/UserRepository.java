package org.example.please.repository;

import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
    // 이메일로 사용자 존재 여부 확인
    boolean existsByUserEmail(String userEmail);


}
