package com.example.cart.service;

import com.example.cart.entity.Cart;
import com.example.cart.repository.CartRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuestCartService {

    private static final String GUEST_CART_COOKIE = "guest_cart_token";
    private final CartRepository cartRepository;

    public Cart getOrCreateGuestCart(HttpServletRequest request, HttpServletResponse response) {
        String guestToken = getGuestToken(request);

        if (guestToken == null) {
            return createGuestCart(response);
        }

        Cart cart = cartRepository.findByGuestToken(guestToken)
                .orElseGet(() -> createGuestCart(guestToken, response));
        return cart;
    }

    public String getGuestToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (GUEST_CART_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private Cart createGuestCart(HttpServletResponse response) {
        String guestToken = UUID.randomUUID().toString();
        return createGuestCart(guestToken, response);
    }

    private Cart createGuestCart(String guestToken, HttpServletResponse response) {
        Cart cart = new Cart();
        cart.setGuestToken(guestToken);
        Cart savedCart = cartRepository.save(cart);
        Cookie cookie = new Cookie(GUEST_CART_COOKIE, guestToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24 * 30); // 30 days

        response.addCookie(cookie);

        return savedCart;
    }

    public void clearGuestCartCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(GUEST_CART_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
