package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.dtos.DashboardSummaryDTO;
import com.UdeA.GestionFinanzas.facades.FinancialDashboardFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private FinancialDashboardFacade dashboardFacade;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getDashboard(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        try {
            DashboardSummaryDTO summary = dashboardFacade.getDashboardSummary(userId, inicio, fin);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al cargar el dashboard: " + e.getMessage());
        }
    }
}
