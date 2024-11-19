package org.example.please.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class DiaryPhotoUrlService {

    @Value("${server.base.url}")
    private String serverBaseUrl;

    /**
     * JSON 배열로 저장된 사진 파일명을 URL로 변환
     */
    public List<String> createImageUrls(String diaryPhotoJson) throws IOException {
        List<String> urls = new ArrayList<>();

        if (diaryPhotoJson != null && !diaryPhotoJson.isEmpty()) {
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> fileNames = objectMapper.readValue(diaryPhotoJson, new TypeReference<List<String>>() {});

            for (String fileName : fileNames) {
                // 이미 URL인지 확인
                if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
                    urls.add(fileName); // 이미 URL이면 그대로 추가
                } else {
                    urls.add(serverBaseUrl + "/uploads/images/db/" + fileName); // URL로 변환
                }
            }
        }

        return urls;
    }
}
