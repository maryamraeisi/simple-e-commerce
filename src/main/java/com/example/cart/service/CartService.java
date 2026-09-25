package com.example.cart.service;

import com.example.cart.dto.*;
import com.example.cart.entity.Cart;
import com.example.cart.entity.CartItem;
import com.example.cart.mapper.CartMapper;
import com.example.cart.repository.CartItemRepository;
import com.example.cart.repository.CartRepository;
import com.example.customer.entity.Customer;
import com.example.infrastructure.security.UserContext;
import com.example.product.entity.Product;
import com.example.product.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserContext userContext;
    private final ProductService productService;
    private final GuestCartService guestCartService;

    public CartResponse addToCart(AddToCartRequest addToCartRequest,
                                  HttpServletRequest httpRequest,
                                  HttpServletResponse httpResponse) {
        Cart currentCart = getCurrentCart(httpRequest, httpResponse);

        Product product = productService.getProductById(addToCartRequest.productId());
        validateProduct(product);

        Optional<CartItem> cartItemOptional = findCartItemByProductId(currentCart, addToCartRequest.productId());
        if (cartItemOptional.isPresent()) {
            updateCartItemQuantity(currentCart, addToCartRequest);
        } else {
            createCartItem(addToCartRequest.quantity(), currentCart, product);
        }
        cartRepository.save(currentCart);

        return CartMapper.toResponse(currentCart);
    }

    public void changeItemQuantity(Long itemId, UpdateCartItemRequest request,
                                   HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Cart currentCart = getCurrentCart(httpRequest, httpResponse);
        CartItem cartItem = findCartItemById(currentCart, itemId);
        cartItem.setQuantity(request.quantity());
        cartItemRepository.save(cartItem);
    }

    public void deleteItem(Long itemId, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Cart currentCart = getCurrentCart(httpRequest, httpResponse);
        CartItem cartItem = findCartItemById(currentCart, itemId);
        cartItemRepository.delete(cartItem);
    }

    public void deleteAllItems(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Cart currentCart = getCurrentCart(httpRequest, httpResponse);
        currentCart.getCartItems().clear();
        cartRepository.save(currentCart);
    }

    public CartResponse getUserCart(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Cart currentCart = getCurrentCart(httpRequest, httpResponse);
        return CartMapper.toResponse(currentCart);
    }

    @Transactional
    public void mergeGuestCart(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String guestToken = guestCartService.getGuestToken(httpRequest);
        if (guestToken == null) {
            return;
        }

        Optional<Cart> guestCartOptional = cartRepository.findByGuestToken(guestToken);
        if (guestCartOptional.isEmpty()) {
            guestCartService.clearGuestCartCookie(httpResponse);
            return;
        }

        Cart guestCart = guestCartOptional.get();
        Customer customer = userContext.getCurrentUser();
        Optional<Cart> customerCartOptional = cartRepository.findByCustomerId(customer.getId());
        if (customerCartOptional.isEmpty()) {
            assignGuestCartToCustomer(guestCart, customer);
        } else {
            mergeItems(customerCartOptional.get(), guestCart);
        }
        guestCartService.clearGuestCartCookie(httpResponse);
    }

    private void mergeItems(Cart customerCart, Cart guestCart) {
        for (CartItem guestItem : guestCart.getCartItems()) {
            Optional<CartItem> customerItem = findCartItemByProductId(customerCart, guestItem.getProduct().getId());

            if (customerItem.isPresent()) {
                customerItem.get().setQuantity(customerItem.get().getQuantity() + guestItem.getQuantity());
            } else {
                createCartItem(guestItem.getQuantity(), customerCart, guestItem.getProduct());
            }
        }

        cartRepository.save(customerCart);
        cartRepository.delete(guestCart);
    }

    private void assignGuestCartToCustomer(Cart guestCart, Customer customer) {
        guestCart.setCustomer(customer);
        guestCart.setGuestToken(null);
        cartRepository.save(guestCart);
    }

    private void updateCartItemQuantity(Cart cart, AddToCartRequest request) {
        CartItem cartItem = findCartItemByProductId(cart, request.productId()).get();
        cartItem.setQuantity(cartItem.getQuantity() + request.quantity());
    }

    private void createCartItem(int quantity, Cart cart, Product product) {
        CartItem newCartItem = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(quantity)
                .build();

        cart.getCartItems().add(newCartItem);
    }

    private Optional<CartItem> findCartItemByProductId(Cart cart, Long productId) {
        return cart.getCartItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
    }

    private CartItem findCartItemById(Cart cart, Long itemId) {
        return cart.getCartItems()
                .stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("cart item not found: " + itemId));
    }

    private void validateProduct(Product product) {
        if (!product.isActive()) {
            throw new IllegalStateException("Product is not available.");
        }
    }

    private Cart createNewCartForCustomer(Customer customer) {
        Cart cart = Cart.builder()
                .customer(customer)
                .cartItems(new ArrayList<>())
                .build();

        return cartRepository.save(cart);
    }

    private Cart getCustomerCart() {
        Customer customer = userContext.getCurrentUser();

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> createNewCartForCustomer(customer));

        return cart;
    }

    private Cart getCurrentCart(HttpServletRequest request, HttpServletResponse response) {
        if (userContext.isAuthenticated()) {
            return getCustomerCart();
        }

        return guestCartService.getOrCreateGuestCart(request, response);
    }
}
