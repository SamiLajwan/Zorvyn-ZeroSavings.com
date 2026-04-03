package com.finance.dashboard.controller;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.service.FinancialRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FinancialRecordService recordService;

    @GetMapping("/summary")
    public ResponseEntity<Dto.DashboardSummary> getSummary() {
        return ResponseEntity.ok(recordService.getDashboard());
    }
}
