package com.example.inventory.repository;

import com.example.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product")
    List<Inventory> findAllWithProduct();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select i from Inventory i
            join fetch i.product
            where i.product.id = :productId
            """)
    Optional<Inventory> findByProductIdForUpdate(Long productId);
}
