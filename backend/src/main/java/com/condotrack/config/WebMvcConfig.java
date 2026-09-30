package com.condotrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    // Direct static resource handler for /uploads/** removed to prevent public bypass (RNF-03).
    // Media access is protected and served via authenticated controller endpoints.
}
