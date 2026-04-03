package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    public static class IngresoRequest {
        public Long userId;
        public Long categoryId;
        public Double monto;
        public LocalDate fecha;
        public String descripcion;
    }

    @PostMapping("/income")
    public ResponseEntity<?> registrarIngreso(@RequestBody IngresoRequest req) {
        try {
            Transaction result = transactionService.registrarIngreso(
                    req.userId,
                    req.categoryId,
                    req.monto,
                    req.fecha,
                    req.descripcion);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> obtenerTransaccionesUsuario(@PathVariable Long userId) {
        try {
            List<Transaction> transacciones = transactionService.listarTransaccionesPorUsuario(userId);
            return ResponseEntity.ok(transacciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<?> obtenerBalanceUsuario(@PathVariable Long userId) {
        try {
            Double balance = transactionService.calcularBalanceUsuario(userId);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
