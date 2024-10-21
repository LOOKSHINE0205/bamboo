package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name ="user_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {
    // 사용자 ID
    @Id
    @EqualsAndHashCode.Include
    private String user_id;

    // 비밀번호
    private String user_pw;

    // 생년월일
    private Date user_birthdate;

    // 방해금지시작
    private Timestamp quiet_start_time;

    // 방해금지 끝
    private Timestamp quiet_end_time;

    // 챗봇 타입
    private String chatbot_type;

    // 가입 일자
    private Timestamp joined_at;

    // 챗봇 이름
    private String chatbot_name;

    // 챗봇 레벨
    private int chatbot_level;
}
