package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import com.UdeA.GestionFinanzas.services.TransactionService;
import com.UdeA.GestionFinanzas.services.FinancialAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private FinancialAnalysisService financialAnalysisService;

    public static class IngresoRequest {
        public Long userId;
        public Long categoryId;
        public Double monto;
        public LocalDateTime fecha;
        public String descripcion;
    }

@PostMapping("/register")
public ResponseEntity<?> registrar(@RequestBody Transaction transaction) {
    try {
        // Ahora pasamos el objeto completo al servicio
        Transaction nueva = transactionService.registrarTransaccion(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body("Error al procesar el registro: " + e.getMessage());
    }
}


@GetMapping("/user/{userId}/balance")
public ResponseEntity<?> obtenerBalanceUsuario(
        @PathVariable Long userId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
    
    try {
        Double balance = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);
        return ResponseEntity.ok(balance);
        
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("Error al procesar el balance");
    }

}
@GetMapping("/{userId}/transactions/history")
    public ResponseEntity<List<Transaction>> getHistorico(
            @PathVariable Long userId, // El ID viene de la URL
            @RequestParam(required = false) TransactionType tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        return ResponseEntity.ok(transactionService.consultarHistoricoFiltrado(userId, tipo, inicio, fin));
    }

@GetMapping("/{userId}/transactions/ahorro")
    public ResponseEntity<?> getTasaAhorro(
            @PathVariable Long userId, // El ID viene de la URL
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        return ResponseEntity.ok(financialAnalysisService.calcularTasaAhorro(userId, inicio, fin));
    }

}
