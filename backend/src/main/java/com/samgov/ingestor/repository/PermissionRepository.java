package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Permission;
import com.samgov.ingestor.model.Permission.PermissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByCode(String code);

    List<Permission> findByCategory(PermissionCategory category);

    @Query("SELECT p FROM Permission p ORDER BY p.category, p.code")
    List<Permission> findAllOrderedByCategoryAndCode();

    boolean existsByCode(String code);
}
