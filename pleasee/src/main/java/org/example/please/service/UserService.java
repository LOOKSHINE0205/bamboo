package org.example.please.service;

import lombok.Setter;
import org.example.please.entity.User;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //이메일 중복체크 및 회원가입
    public String  checkEmail(User user) {
        if (userRepository.existsByUserEmail(user.getUserEmail())) {
            return "중복";
        }
        return "미중복";
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

}
