package org.example.please.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/images/db/** 경로를 통해 이미지 파일을 접근하도록 설정
        registry.addResourceHandler("/uploads/images/db/**")
                .addResourceLocations("file:/C:/uploads/images/db/");
    }
}
