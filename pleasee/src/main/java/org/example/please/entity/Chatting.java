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
@Table(name ="chatting_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Chatting {
    @Id
    @EqualsAndHashCode.Include
    // 채팅 식별자
    private int chat_idx;

    // 방 식별자
    private int croom_idx;

    // 발화자
    private String chatter;

    // 발화 내용
    private String chat_content;

    // 발화 이모티콘
    private String chat_emoticon;

    // 발화 파일
    private String chat_file;

    // 발화 시간
    private Timestamp created_at;

    // 감정 태그
    private String emotion_tag;
}
