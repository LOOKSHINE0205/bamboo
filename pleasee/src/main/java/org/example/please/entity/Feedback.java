package org.example.please.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name ="feedback_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Feedback {
    @Id
    @EqualsAndHashCode.Include
    // 피드백 식별자
    private int feedback_idx;

    // 채팅 식별자
    private int chat_idx;

    // 평가 점수
    private Integer chatbot_score;

    // 사용자 아이디
    private String user_email;

    // 등록 일자 current_timestamp
    private Timestamp created_at;
}
