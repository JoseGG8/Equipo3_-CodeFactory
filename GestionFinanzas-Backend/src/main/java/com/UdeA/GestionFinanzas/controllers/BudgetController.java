package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.Budget;
import com.UdeA.GestionFinanzas.services.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.UdeA.GestionFinanzas.dtos.BudgetProgressDTO;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/register")
    public ResponseEntity<?> registrarPresupuesto(@RequestBody Budget presupuesto) {
        try {
            Budget nuevo = budgetService.crearPresupuesto(presupuesto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar el presupuesto: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> obtenerPresupuestos(@PathVariable Long userId) {
        List<Budget> presupuestos = budgetService.obtenerPresupuestosUsuario(userId);
        return ResponseEntity.ok(presupuestos);
    }

    @GetMapping("/user/{userId}/progress")
    public ResponseEntity<List<BudgetProgressDTO>> obtenerProgresoTodosPresupuestos(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(budgetService.consultarProgresoTodos(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPresupuesto(@PathVariable Long id) {
        try {
            Budget presupuesto = budgetService.obtenerPresupuestoPorId(id);
            return ResponseEntity.ok(presupuesto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<?> obtenerProgresoPresupuesto(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(budgetService.consultarProgreso(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPresupuesto(@PathVariable Long id, @RequestBody Budget presupuesto) {
        try {
            Budget actualizado = budgetService.actualizarPresupuesto(id, presupuesto);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPresupuesto(@PathVariable Long id) {
        try {
            budgetService.eliminarPresupuesto(id);
            return ResponseEntity.ok("Presupuesto eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
