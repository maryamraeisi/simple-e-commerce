package com.example.infrastructure.security.service;

import com.example.infrastructure.security.entity.AppUser;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UserContext {

    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AppUserDetails userDetails = validateAuthentication(authentication);
        return userDetails.getUser();
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AppUserDetails userDetails = validateAuthentication(authentication);
        return userDetails.getUser().getId();
    }

    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    private AppUserDetails validateAuthentication(Authentication authentication) {
        if (authentication == null ||
                !authentication.isAuthenticated() ||
                !(authentication.getPrincipal() instanceof AppUserDetails userDetails)) {
            throw new IllegalStateException("No authenticated user");
        }
        return userDetails;
    }
}
