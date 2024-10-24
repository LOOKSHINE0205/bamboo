package org.example.please.service;

import lombok.Setter;
import org.example.please.entity.User;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //이메일 중복체크
    public boolean checkEmail(User user) {
        return userRepository.existsByUserEmail(user.getUserEmail());
    }

    // db insert
    public void saveUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getUserPw());  // 비번암호화 BCrypt 사용
        user.setUserPw(encodedPassword);
        userRepository.save(user);
    }

    // 로그인
    public boolean login(User user) {
        Optional<User> foundUser = userRepository.findByUserEmail(user.getUserEmail());
        return foundUser.filter(value -> passwordEncoder.matches(user.getUserPw(), value.getUserPw())).isPresent();
    }

    // 비밀번호만 업데이트
    public void updatePassword(User user) {
        Optional<User> optionalUser = userRepository.findByUserEmail(user.getUserEmail());

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();

            // 비밀번호가 입력된 경우 암호화하여 업데이트
            if (user.getUserPw() != null && !user.getUserPw().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(user.getUserPw());
                existingUser.setUserPw(encodedPassword);  // 비밀번호만 변경
            }

            // 업데이트된 정보 저장
            userRepository.save(existingUser);
        }
    }

}
