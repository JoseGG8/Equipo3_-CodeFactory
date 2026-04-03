package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Category;
import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.CategoryRepository;
import com.UdeA.GestionFinanzas.repositories.TransactionRepository;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Transaction registrarIngreso(Long userId, Long categoryId, Double monto, LocalDate fecha, String descripcion) throws Exception {
        if (monto == null || monto <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        Category categoria = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new Exception("Categoría no encontrada"));

        if (!"INGRESO".equalsIgnoreCase(categoria.getTipo())) {
            throw new IllegalArgumentException("La categoría no corresponde a un ingreso");
        }

        Transaction ingreso = new Transaction();
        ingreso.setUsuario(usuario);
        ingreso.setCategoria(categoria);
        ingreso.setMonto(monto);
        ingreso.setFecha(fecha != null ? fecha : LocalDate.now());
        ingreso.setDescripcion(descripcion);
        ingreso.setTipo("INGRESO");

        return transactionRepository.save(ingreso);
    }

    public List<Transaction> listarTransaccionesPorUsuario(Long userId) throws Exception {
        if (!userRepository.existsById(userId)) {
            throw new Exception("Usuario no encontrado");
        }
        return transactionRepository.findByUsuarioId(userId);
    }

    public Double calcularBalanceUsuario(Long userId) throws Exception {
        List<Transaction> transacciones = listarTransaccionesPorUsuario(userId);
        double balance = 0.0;
        for (Transaction t : transacciones) {
            if ("INGRESO".equalsIgnoreCase(t.getTipo())) {
                balance += t.getMonto();
            } else if ("GASTO".equalsIgnoreCase(t.getTipo())) {
                balance -= t.getMonto();
            }
        }
        return balance;
    }
}
