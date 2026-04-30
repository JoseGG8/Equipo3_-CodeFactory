package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.*;
import com.UdeA.GestionFinanzas.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

public Transaction registrarTransaccion(Long userId, Long categoryId, Double monto, 
                                       LocalDateTime fecha, String descripcion, 
                                       TransactionType tipo) throws Exception {
    
    // 1. Validaciones Comunes
    if (monto == null || monto <= 0) {
        throw new IllegalArgumentException("El monto debe ser mayor a cero");
    }

    User usuario = userRepository.findById(userId)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

    Category categoria = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new Exception("Categoría no encontrada"));

    // 2. Validación de Negocio Cruzada
    // Verificamos que si el tipo es INGRESO, la categoría también lo sea
    if (!tipo.name().equalsIgnoreCase(categoria.getTipo())) {
        throw new IllegalArgumentException("La categoría no coincide con el tipo de transacción");
    }

    // 3. Creación y Persistencia
    Transaction transaccion = new Transaction();
    transaccion.setUsuario(usuario);
    transaccion.setCategoria(categoria);
    transaccion.setMonto(monto);
    transaccion.setFecha(fecha != null ? fecha : LocalDateTime.now());
    transaccion.setDescripcion(descripcion);
    transaccion.setTipo(tipo); // Aquí se asigna INGRESO o GASTO dinámicamente

    return transactionRepository.save(transaccion);
}

    // HU7/HU13: Listar histórico
public List<Transaction> consultarHistoricoFiltrado(Long userId, TransactionType tipo, LocalDateTime inicio, LocalDateTime fin) {
if (inicio.isAfter(fin)) {
        throw new IllegalArgumentException("Rango de fechas inválido");
    }

    if (tipo == null) {
        // Si no mandan tipo, traemos todo el histórico
        return transactionRepository.findByUsuarioIdAndFechaBetween(userId, inicio, fin);
    } else {
        // Si mandan tipo, filtramos (lo que tienes ahora)
        return transactionRepository.findByUsuarioIdAndTipoAndFechaBetween(userId, tipo, inicio, fin);
    }
}

    // Lógica para balance
public Double calcularBalanceTotalPeriodo(Long userId, LocalDateTime inicio, LocalDateTime fin) {
    // 1. Obtenemos ingresos usando el método robusto que ya tienes
    List<Transaction> ingresos = consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin);
    
    // 2. Obtenemos gastos
    List<Transaction> gastos = consultarHistoricoFiltrado(userId, TransactionType.GASTO, inicio, fin);

    // 3. Sumamos cada lista
    Double totalIngresos = ingresos.stream().mapToDouble(Transaction::getMonto).sum();
    Double totalGastos = gastos.stream().mapToDouble(Transaction::getMonto).sum();

    // 4. Retornamos el resultado de la lógica de negocio
    return totalIngresos - totalGastos;
}

}