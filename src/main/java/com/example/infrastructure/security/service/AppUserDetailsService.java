package com.example.infrastructure.security.service;

import com.example.infrastructure.security.repository.AppUserRepository;
import com.example.infrastructure.security.entity.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return new AppUserDetails(user);
    }
}
