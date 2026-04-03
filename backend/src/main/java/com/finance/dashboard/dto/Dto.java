package com.finance.dashboard.dto;

import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;

public class Dto {

    // ---- Auth ----
    @Data
    public static class LoginRequest {
        @NotBlank String username;
        @NotBlank String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
        public AuthResponse(String token, String username, String role) {
            this.token = token; this.username = username; this.role = role;
        }
    }

    // ---- User ----
    @Data
    public static class CreateUserRequest {
        @NotBlank @Size(min = 3, max = 50) public String username;
        @NotBlank @Size(min = 6) public String password;
        @NotBlank @Email public String email;
        public User.Role role = User.Role.VIEWER;
    }

    @Data
    public static class UpdateUserRequest {
        @Email public String email;
        public User.Role role;
        public User.Status status;
    }

    @Data
    public static class UserResponse {
        public Long id;
        public String username;
        public String email;
        public User.Role role;
        public User.Status status;
        public static UserResponse from(User u) {
            UserResponse r = new UserResponse();
            r.id = u.getId(); r.username = u.getUsername();
            r.email = u.getEmail(); r.role = u.getRole(); r.status = u.getStatus();
            return r;
        }
    }

    // ---- Financial Record ----
    @Data
    public static class RecordRequest {
        @NotNull @Positive public BigDecimal amount;
        @NotNull public FinancialRecord.Type type;
        @NotBlank public String category;
        @NotNull public LocalDate date;
        public String notes;
    }

    @Data
    public static class RecordResponse {
        public Long id;
        public BigDecimal amount;
        public FinancialRecord.Type type;
        public String category;
        public LocalDate date;
        public String notes;
        public String createdBy;
        public static RecordResponse from(FinancialRecord r) {
            RecordResponse res = new RecordResponse();
            res.id = r.getId(); res.amount = r.getAmount(); res.type = r.getType();
            res.category = r.getCategory(); res.date = r.getDate(); res.notes = r.getNotes();
            res.createdBy = r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null;
            return res;
        }
    }

    // ---- Dashboard ----
    @Data
    public static class DashboardSummary {
        public BigDecimal totalIncome;
        public BigDecimal totalExpenses;
        public BigDecimal netBalance;
        public Map<String, BigDecimal> incomeByCategory;
        public Map<String, BigDecimal> expenseByCategory;
        public List<MonthlyTrend> monthlyTrends;
        public List<RecordResponse> recentActivity;
    }

    @Data
    public static class MonthlyTrend {
        public int year;
        public int month;
        public BigDecimal income;
        public BigDecimal expenses;
    }

    // ---- Common ----
    @Data
    public static class ApiError {
        public int status;
        public String message;
        public ApiError(int status, String message) {
            this.status = status; this.message = message;
        }
    }

    @Data
    public static class PageResponse<T> {
        public List<T> content;
        public long totalElements;
        public int totalPages;
        public int page;
        public int size;
    }
}
