package com.UdeA.GestionFinanzas.facades;

import com.UdeA.GestionFinanzas.dtos.DashboardSummaryDTO;
import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.services.FinancialAnalysisService;
import com.UdeA.GestionFinanzas.services.TransactionService;
import com.UdeA.GestionFinanzas.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class FinancialDashboardFacade {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private FinancialAnalysisService analysisService;

    @Autowired
    private UserService userService;

    public DashboardSummaryDTO getDashboardSummary(Long userId, LocalDateTime inicio, LocalDateTime fin) throws Exception {
        // 1. Obtener la información del usuario
        User user = userService.obtenerUsuarioPorId(userId);

        // 2. Calcular balance total
        Double balance = analysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);

        // 3. Obtener el historial de transacciones (sin filtrar por tipo)
        List<Transaction> ultimasTransacciones = transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin);

        // 4. Calcular tasa de ahorro
        Double tasaAhorro = analysisService.calcularTasaAhorro(userId, inicio, fin);

        // 5. Ensamblar y retornar el DTO unificado
        return new DashboardSummaryDTO(user.getNombre(), balance, tasaAhorro, ultimasTransacciones);
    }
}
