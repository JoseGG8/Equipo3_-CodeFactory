package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FinancialAnalysisService {

    @Autowired
    private TransactionService transactionService;

    public Double calcularBalanceTotalPeriodo(Long userId, LocalDateTime inicio, LocalDateTime fin) {
        List<Transaction> transacciones = transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin);
        return transacciones.stream().mapToDouble(Transaction::getImpactoFinanciero).sum();
    }

    public Double calcularTasaAhorro(Long userId, LocalDateTime inicio, LocalDateTime fin) {

        List<Transaction> ingresos = transactionService.consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin);
        Double totalIngresos = ingresos.stream().mapToDouble(Transaction::getMonto).sum();
        Double balance = calcularBalanceTotalPeriodo(userId, inicio, fin);
        Double tasaAhorro = (balance/totalIngresos)*100;

        return tasaAhorro;
    }

}
