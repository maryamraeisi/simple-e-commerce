package com.example.product.repository;

import com.example.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
            select p from Product p
            left join fetch p.inventory
            """)
    List<Product> findAllWithInventory();

    @Query("""
            select p from Product p
            left join fetch p.inventory
            where p.id = :id
            """)
    Optional<Product> findByIdWithInventory(Long id);
}
