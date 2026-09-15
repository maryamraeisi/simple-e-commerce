package com.example.product.service;

import com.example.infrastructure.storage.FileStorageService;
import com.example.infrastructure.storage.StorageDirectory;
import com.example.inventory.entity.Inventory;
import com.example.product.repository.ProductRepository;
import com.example.product.dto.CreateProductRequest;
import com.example.product.dto.ProductResponse;
import com.example.product.dto.UpdateProductRequest;
import com.example.product.entity.Product;
import com.example.product.mapper.ProductMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProductResponse create(CreateProductRequest request, MultipartFile image) {
        String imageUrl = fileStorageService.store(image, StorageDirectory.PRODUCTS);
        Product product = createNewProduct(request, imageUrl);
        Inventory inventory = createNewInventory(product);
        product.setInventory(inventory);
        product = repository.save(product);
        return ProductMapper.toResponse(product);
    }

    public ProductResponse getById(Long id) {
        Product product = repository.findById(id).orElseThrow();
        return ProductMapper.toResponse(product);
    }

    public List<ProductResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    public ProductResponse update(Long id, UpdateProductRequest request, MultipartFile image) {
        Product product = repository.findById(id).orElseThrow();

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());

        if (request.active() != null) {
            product.setActive(request.active());
        }

        if (image != null && !image.isEmpty()) {
            updateProductImage(image, product);
        }

        product = repository.save(product);

        return ProductMapper.toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = repository.findById(id).orElseThrow();
        String imageUrl = product.getImageUrl();
        repository.delete(product);
        fileStorageService.delete(imageUrl);
    }

    private void updateProductImage(MultipartFile image, Product product) {
        String oldImageUrl = product.getImageUrl();
        String newImageUrl = fileStorageService.store(image, StorageDirectory.PRODUCTS);
        product.setImageUrl(newImageUrl);
        fileStorageService.delete(oldImageUrl);
    }

    private Inventory createNewInventory(Product product) {
        return Inventory.builder()
                .product(product)
                .quantity(0)
                .reservedQuantity(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Product createNewProduct(CreateProductRequest request, String imageUrl) {
        return Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(imageUrl)
                .active(true)
                .build();
    }
}
