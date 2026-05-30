package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Budget;
import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.BudgetRepository;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.UdeA.GestionFinanzas.dtos.BudgetProgressDTO;
import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.repositories.TransactionRepository;

import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public Budget crearPresupuesto(Budget presupuesto) throws Exception {
        if (presupuesto.getMontoTotal() == null || presupuesto.getMontoTotal() <= 0) {
            throw new IllegalArgumentException("El presupuesto debe ser mayor a cero");
        }

        if (presupuesto.getMes() == null || presupuesto.getMes() < 1 || presupuesto.getMes() > 12) {
            throw new IllegalArgumentException("El mes debe ser un valor entre 1 y 12");
        }

        if (presupuesto.getAño() == null || presupuesto.getAño() < 1900) {
            throw new IllegalArgumentException("Año inválido");
        }

        User usuario = userRepository.findById(presupuesto.getUsuario().getId())
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        if (presupuesto.getNombre() == null || presupuesto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del presupuesto es obligatorio");
        }

        presupuesto.setUsuario(usuario);
        return budgetRepository.save(presupuesto);
    }

    public List<Budget> obtenerPresupuestosUsuario(Long userId) {
        return budgetRepository.findByUsuarioId(userId);
    }

    public Budget obtenerPresupuestoPorId(Long id) throws Exception {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new Exception("Presupuesto no encontrado"));
    }

    public Budget actualizarPresupuesto(Long id, Budget presupuestoActualizado) throws Exception {
        Budget presupuesto = budgetRepository.findById(id)
                .orElseThrow(() -> new Exception("Presupuesto no encontrado"));

        if (presupuestoActualizado.getMontoTotal() != null) {
            if (presupuestoActualizado.getMontoTotal() <= 0) {
                throw new IllegalArgumentException("El monto debe ser mayor a cero");
            }
            presupuesto.setMontoTotal(presupuestoActualizado.getMontoTotal());
        }

        if (presupuestoActualizado.getNombre() != null && !presupuestoActualizado.getNombre().trim().isEmpty()) {
            presupuesto.setNombre(presupuestoActualizado.getNombre());
        }

        return budgetRepository.save(presupuesto);
    }

    public void eliminarPresupuesto(Long id) throws Exception {
        Budget presupuesto = budgetRepository.findById(id)
                .orElseThrow(() -> new Exception("Presupuesto no encontrado"));
        budgetRepository.delete(presupuesto);
    }
    
    public BudgetProgressDTO consultarProgreso(Long id) throws Exception {
        Budget presupuesto = budgetRepository.findById(id)
                .orElseThrow(() -> new Exception("Presupuesto no encontrado"));

        return calcularProgresoPresupuesto(presupuesto);
    }
    
    public List<BudgetProgressDTO> consultarProgresoTodos(Long userId) {
        List<Budget> presupuestos = budgetRepository.findByUsuarioId(userId);
        
        return presupuestos.stream()
                .map(this::calcularProgresoPresupuesto)
                .toList();
    }
    
    private BudgetProgressDTO calcularProgresoPresupuesto(Budget presupuesto) {
        List<Transaction> transacciones = transactionRepository.findByPresupuestoId(presupuesto.getId());
        
        double montoGastado = transacciones.stream()
                .mapToDouble(Transaction::getMonto)
                .sum();
                
        double porcentaje = 0.0;
        if (presupuesto.getMontoTotal() > 0) {
            porcentaje = (montoGastado / presupuesto.getMontoTotal()) * 100;
        }

        BudgetProgressDTO dto = new BudgetProgressDTO();
        dto.setBudgetId(presupuesto.getId());
        dto.setNombre(presupuesto.getNombre());
        dto.setMontoTotal(presupuesto.getMontoTotal());
        dto.setMontoGastado(montoGastado);
        dto.setPorcentaje(Math.round(porcentaje * 100.0) / 100.0); // Redondear a 2 decimales

        return dto;
    }
}
