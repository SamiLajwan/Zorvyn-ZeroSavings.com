package com.finance.dashboard.service;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FinancialRecordService {

    private final FinancialRecordRepository recordRepo;
    private final UserRepository userRepo;

    public Dto.PageResponse<Dto.RecordResponse> getAll(
            FinancialRecord.Type type, String category,
            LocalDate from, LocalDate to, int page, int size) {
        Page<FinancialRecord> result = recordRepo.findWithFilters(
                type, category, from, to,
                PageRequest.of(page, size, Sort.by("date").descending()));
        Dto.PageResponse<Dto.RecordResponse> response = new Dto.PageResponse<>();
        response.content = result.getContent().stream().map(Dto.RecordResponse::from).toList();
        response.totalElements = result.getTotalElements();
        response.totalPages = result.getTotalPages();
        response.page = page;
        response.size = size;
        return response;
    }

    public Dto.RecordResponse getById(Long id) {
        return Dto.RecordResponse.from(findOrThrow(id));
    }

    public Dto.RecordResponse create(Dto.RecordRequest req) {
        FinancialRecord record = new FinancialRecord();
        mapRequest(req, record);
        record.setCreatedBy(currentUser());
        return Dto.RecordResponse.from(recordRepo.save(record));
    }

    public Dto.RecordResponse update(Long id, Dto.RecordRequest req) {
        FinancialRecord record = findOrThrow(id);
        mapRequest(req, record);
        return Dto.RecordResponse.from(recordRepo.save(record));
    }

    public void delete(Long id) {
        FinancialRecord record = findOrThrow(id);
        record.setDeleted(true);
        recordRepo.save(record);
    }

    public Dto.DashboardSummary getDashboard() {
        BigDecimal income = recordRepo.sumByType(FinancialRecord.Type.INCOME);
        BigDecimal expenses = recordRepo.sumByType(FinancialRecord.Type.EXPENSE);

        Dto.DashboardSummary summary = new Dto.DashboardSummary();
        summary.totalIncome = income;
        summary.totalExpenses = expenses;
        summary.netBalance = income.subtract(expenses);
        summary.incomeByCategory = toMap(recordRepo.sumByCategory(FinancialRecord.Type.INCOME));
        summary.expenseByCategory = toMap(recordRepo.sumByCategory(FinancialRecord.Type.EXPENSE));
        summary.monthlyTrends = buildTrends(recordRepo.monthlyTrends(LocalDate.now().minusMonths(6)));
        summary.recentActivity = recordRepo.findRecentActivity(PageRequest.of(0, 10))
                .stream().map(Dto.RecordResponse::from).toList();
        return summary;
    }

    private void mapRequest(Dto.RecordRequest req, FinancialRecord record) {
        record.setAmount(req.amount);
        record.setType(req.type);
        record.setCategory(req.category);
        record.setDate(req.date);
        record.setNotes(req.notes);
    }

    private Map<String, BigDecimal> toMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : rows) map.put((String) row[0], (BigDecimal) row[1]);
        return map;
    }

    private List<Dto.MonthlyTrend> buildTrends(List<Object[]> rows) {
        Map<String, Dto.MonthlyTrend> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            FinancialRecord.Type type = FinancialRecord.Type.valueOf(row[2].toString());
            BigDecimal amount = (BigDecimal) row[3];
            String key = year + "-" + month;
            Dto.MonthlyTrend trend = map.computeIfAbsent(key, k -> {
                Dto.MonthlyTrend t = new Dto.MonthlyTrend();
                t.year = year; t.month = month;
                t.income = BigDecimal.ZERO; t.expenses = BigDecimal.ZERO;
                return t;
            });
            if (type == FinancialRecord.Type.INCOME) trend.income = amount;
            else trend.expenses = amount;
        }
        return new ArrayList<>(map.values());
    }

    private FinancialRecord findOrThrow(Long id) {
        return recordRepo.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Record not found: " + id));
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow();
    }
}
