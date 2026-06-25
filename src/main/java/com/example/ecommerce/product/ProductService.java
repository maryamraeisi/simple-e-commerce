package com.example.ecommerce.product;

import com.example.ecommerce.product.dto.CreateProductRequest;
import com.example.ecommerce.product.dto.ProductResponse;
import com.example.ecommerce.product.dto.UpdateProductRequest;
import com.example.ecommerce.product.dto.*;
import com.example.ecommerce.product.exception.ProductNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    public ProductResponse create(
            CreateProductRequest request) {

        Product product =
                Product.builder()
                        .name(request.name())
                        .description(request.description())
                        .price(request.price())
                        .imageUrl(request.imageUrl())
                        .active(true)
                        .build();

        product = repository.save(product);

        return ProductMapper.toResponse(product);
    }

    public ProductResponse getById(Long id) {

        Product product =
                repository.findById(id)
                        .orElseThrow(
                                () ->
                                        new ProductNotFoundException(id));

        return ProductMapper.toResponse(product);
    }

    public List<ProductResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    public ProductResponse update(
            Long id,
            UpdateProductRequest request) {

        Product product =
                repository.findById(id)
                        .orElseThrow(
                                () ->
                                        new ProductNotFoundException(id));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());

        if (request.active() != null) {
            product.setActive(request.active());
        }

        product = repository.save(product);

        return ProductMapper.toResponse(product);
    }

    public void delete(Long id) {

        Product product =
                repository.findById(id)
                        .orElseThrow(
                                () ->
                                        new ProductNotFoundException(id));

        repository.delete(product);
    }
}
