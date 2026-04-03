package com.finance.dashboard.repository;

import com.finance.dashboard.entity.FinancialRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

    @Query("SELECT r FROM FinancialRecord r WHERE r.deleted = false " +
           "AND (:type IS NULL OR r.type = :type) " +
           "AND (:category IS NULL OR LOWER(r.category) LIKE LOWER(CONCAT('%', :category, '%'))) " +
           "AND (:from IS NULL OR r.date >= :from) " +
           "AND (:to IS NULL OR r.date <= :to)")
    Page<FinancialRecord> findWithFilters(
            @Param("type") FinancialRecord.Type type,
            @Param("category") String category,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM FinancialRecord r WHERE r.deleted = false AND r.type = :type")
    BigDecimal sumByType(@Param("type") FinancialRecord.Type type);

    @Query("SELECT r.category, SUM(r.amount) FROM FinancialRecord r WHERE r.deleted = false AND r.type = :type GROUP BY r.category")
    List<Object[]> sumByCategory(@Param("type") FinancialRecord.Type type);

    @Query("SELECT FUNCTION('MONTH', r.date), FUNCTION('YEAR', r.date), r.type, SUM(r.amount) " +
           "FROM FinancialRecord r WHERE r.deleted = false " +
           "AND r.date >= :from GROUP BY FUNCTION('YEAR', r.date), FUNCTION('MONTH', r.date), r.type " +
           "ORDER BY FUNCTION('YEAR', r.date), FUNCTION('MONTH', r.date)")
    List<Object[]> monthlyTrends(@Param("from") LocalDate from);

    @Query("SELECT r FROM FinancialRecord r WHERE r.deleted = false ORDER BY r.date DESC")
    List<FinancialRecord> findRecentActivity(Pageable pageable);
}
