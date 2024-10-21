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
@Table(name ="chatbot_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Chatbot {
    @Id
    @EqualsAndHashCode.Include
    // 방 식별자
    private int croom_idx;

    // 방 제목
    private String croom_title;

    // 방 소개
    private String croom_desc;

    // 방 개설자
    private String user_email;

    // 방 인원수
    private Integer croom_limit;

    // 방 개설일자
    private Timestamp created_at;

    // 방 상태
    private String croom_status;
}
