package org.example.please.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DiaryPhotoService {

    @Value("${file.upload.dir}")
    private String uploadDir; // 파일 저장 경로

    /**
     * 사진 저장 및 JSON 반환
     */
    public String savePhotos(List<MultipartFile> photoFiles) throws IOException {
        List<String> fileNames = new ArrayList<>();

        for (MultipartFile photoFile : photoFiles) {
            if (!photoFile.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + photoFile.getOriginalFilename();
                File targetFile = new File(uploadDir + fileName);

                if (!targetFile.exists()) {
                    targetFile.mkdirs(); // 디렉토리 생성
                }

                photoFile.transferTo(targetFile); // 파일 저장
                fileNames.add(fileName);
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(fileNames); // JSON 배열로 변환 후 반환
    }

    /**
     * URL로부터 사진 다운로드 및 JSON 반환
     */
    public String downloadAndSavePhoto(String imageUrl) throws IOException {
        String fileName = UUID.randomUUID().toString() + ".jpg";
        File outputFile = new File(uploadDir + fileName);

        if (!outputFile.getParentFile().exists()) {
            outputFile.getParentFile().mkdirs(); // 디렉토리 생성
        }

        URL url = new URL(imageUrl);
        FileUtils.copyURLToFile(url, outputFile); // URL로부터 파일 다운로드

        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(List.of(fileName)); // JSON 배열로 반환
    }
}
