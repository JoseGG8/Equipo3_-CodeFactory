package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.dtos.CategoryReportDTO;
import com.UdeA.GestionFinanzas.dtos.FinancialRecommendationsDTO;
import com.UdeA.GestionFinanzas.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/reports/categories/{userId}")
    public ResponseEntity<?> getCategoryReport(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            CategoryReportDTO report = reportService.getCategoryReport(userId, year, month);
            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al generar el reporte: " + e.getMessage());
        }
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<?> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            FinancialRecommendationsDTO recommendations = reportService.getRecommendations(userId, year, month);
            return ResponseEntity.ok(recommendations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al generar las recomendaciones: " + e.getMessage());
        }
    }
}
