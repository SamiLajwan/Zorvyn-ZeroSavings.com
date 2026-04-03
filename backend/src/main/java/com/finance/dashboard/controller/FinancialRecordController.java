package com.finance.dashboard.controller;

import com.finance.dashboard.dto.Dto;
import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.service.FinancialRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class FinancialRecordController {

    private final FinancialRecordService recordService;

    @GetMapping
    public ResponseEntity<Dto.PageResponse<Dto.RecordResponse>> getAll(
            @RequestParam(required = false) FinancialRecord.Type type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(recordService.getAll(type, category, from, to, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dto.RecordResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(recordService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Dto.RecordResponse> create(@Valid @RequestBody Dto.RecordRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recordService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dto.RecordResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody Dto.RecordRequest req) {
        return ResponseEntity.ok(recordService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
