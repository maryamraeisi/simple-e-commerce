package com.example.infrastructure.security.dto;

import com.example.infrastructure.security.entity.Role;

import java.util.Set;

public record AppUserResponse(
        String username,
        Set<Role> role
) {
}
