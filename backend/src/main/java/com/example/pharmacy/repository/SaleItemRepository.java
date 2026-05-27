package com.example.pharmacy.repository;
import com.example.pharmacy.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

  @Query("SELECT si.medicine, SUM(si.quantity), SUM(si.unitPrice * si.quantity) FROM SaleItem si WHERE si.sale.saleDate BETWEEN :start AND :end GROUP BY si.medicine ORDER BY SUM(si.quantity) DESC")
  List<Object[]> getTopSellingMedicines(Instant start, Instant end);

  @Query("SELECT SUM(si.quantity) FROM SaleItem si WHERE si.sale.saleDate BETWEEN :start AND :end")
  Long getTotalItemsSold(Instant start, Instant end);
}
