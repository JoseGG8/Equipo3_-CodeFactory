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

public Transaction registrarTransaccion(Transaction transaccion) throws Exception {
    
    // 1. Validaciones básicas de datos
    if (transaccion.getMonto() == null || transaccion.getMonto() <= 0) {
        throw new IllegalArgumentException("El monto debe ser mayor a cero 💰");
    }

    if (transaccion.getFecha() == null) {
        transaccion.setFecha(LocalDateTime.now()); // Backup por si el front no la envía
    }

    // 2. Validar y cargar Entidades Relacionadas (Usuario y Categoría)
    // Extraemos los IDs que vienen dentro del objeto transaccion
    User usuario = userRepository.findById(transaccion.getUsuario().getId())
            .orElseThrow(() -> new Exception("Usuario no encontrado 👤"));

    Category categoria = categoryRepository.findById(transaccion.getCategoria().getId())
            .orElseThrow(() -> new Exception("Categoría no encontrada 📂"));

    // 3. Validación de Negocio Cruzada
    // Verificamos que el tipo de la transacción coincida con el tipo de la categoría
    if (!transaccion.getTipo().name().equalsIgnoreCase(categoria.getTipo())) {
        throw new IllegalArgumentException("La categoría '" + categoria.getNombre() + 
            "' no es válida para una transacción de tipo " + transaccion.getTipo());
    }

    // 4. Vincular los objetos completos antes de guardar
    transaccion.setUsuario(usuario);
    transaccion.setCategoria(categoria);

    // 5. Persistencia
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
        // Si mandan tipo, filtramos 
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
public Double calcularTasaAhorro(Long userId, LocalDateTime inicio, LocalDateTime fin) {

    List<Transaction> ingresos = consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin);
    Double totalIngresos = ingresos.stream().mapToDouble(Transaction::getMonto).sum();
    Double balance = calcularBalanceTotalPeriodo(userId, inicio, fin);
    Double tasaAhorro = (balance/totalIngresos)*100;

    return tasaAhorro;
}

}