package org.example.please.repository;

import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    // 단순 이메일체크
    boolean existsByUserEmail(String userEmail);
    // 해당 이메일로 사용자 정보를 조회할때 유용함.
   Optional<User> findByUserEmail(String userEmail);

}
