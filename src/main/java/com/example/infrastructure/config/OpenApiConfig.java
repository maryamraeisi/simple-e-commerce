package com.example.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ecommerceOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("E-Commerce API")
                        .description("REST API for the Spring Boot e-commerce application")
                        .version("1.0.0")
                        .contact(new Contact().name("E-Commerce Team"))
                );
    }
}