// src/main/java/com/example/pharmacy/repository/MedicineRepository.java
package com.example.pharmacy.repository;

import com.example.pharmacy.entity.Medicine;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // ✅ NEW METHODS FOR SOFT DELETE
    @Query("SELECT m FROM Medicine m WHERE m.active = true")
    List<Medicine> findByActiveTrue();
    Optional<Medicine> findByIdAndActiveTrue(Long id);
    List<Medicine> findByActiveTrueAndQuantityGreaterThan(int quantity);
    List<Medicine> findByActiveFalse(); // Get inactive medicines

    // Updated existing methods to consider active status
    List<Medicine> findByActiveTrueAndExpiryDateAfterAndQuantityGreaterThan(LocalDate date, int qty);
    List<Medicine> findByActiveTrueAndCategoryContainingIgnoreCase(String category);
    List<Medicine> findByActiveTrueAndNameContainingIgnoreCase(String name);
    List<Medicine> findByActiveTrueAndQuantityLessThanEqual(int threshold);

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.quantity = 0")
    List<Medicine> findOutOfStock();

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.expiryDate < :date")
    List<Medicine> findExpiredMedicines(LocalDate date);

    @Query("SELECT m.category, COUNT(m), SUM(m.quantity), AVG(m.price) FROM Medicine m WHERE m.active = true GROUP BY m.category")
    List<Object[]> getCategorySummary();
}
