package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import com.UdeA.GestionFinanzas.services.strategies.BalanceCalculationStrategy;
import com.UdeA.GestionFinanzas.services.strategies.FinancialAnalysisStrategy;
import com.UdeA.GestionFinanzas.services.strategies.SavingsRateCalculationStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FinancialAnalysisService {

    @Autowired
    private TransactionService transactionService;

    public Double calcularBalanceTotalPeriodo(Long userId, LocalDateTime inicio, LocalDateTime fin) {
        FinancialAnalysisStrategy strategy = new BalanceCalculationStrategy();
        return strategy.analyze(userId, inicio, fin, transactionService);
    }

    public Double calcularTasaAhorro(Long userId, LocalDateTime inicio, LocalDateTime fin) {
        FinancialAnalysisStrategy strategy = new SavingsRateCalculationStrategy();
        return strategy.analyze(userId, inicio, fin, transactionService);
    }

}
