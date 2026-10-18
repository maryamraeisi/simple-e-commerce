package com.example.infrastructure.security.service;

import com.example.infrastructure.security.entity.AppUser;
import com.example.infrastructure.security.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final PasswordEncoder passwordEncoder;

    public AppUser createNewUser(String username, String password, Set<Role> roles) {
        return AppUser.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .roles(roles)
                .build();
    }
}
