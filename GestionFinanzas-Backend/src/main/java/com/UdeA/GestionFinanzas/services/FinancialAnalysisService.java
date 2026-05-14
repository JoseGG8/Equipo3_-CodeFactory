package com.UdeA.GestionFinanzas.services;


import com.UdeA.GestionFinanzas.services.strategies.BalanceCalculationStrategy;
import com.UdeA.GestionFinanzas.services.strategies.SavingsRateCalculationStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class FinancialAnalysisService {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private BalanceCalculationStrategy balanceStrategy;

    @Autowired
    private SavingsRateCalculationStrategy savingsRateStrategy;

    public Double calcularBalanceTotalPeriodo(Long userId, LocalDateTime inicio, LocalDateTime fin) {
        return balanceStrategy.analyze(userId, inicio, fin, transactionService);
    }

    public Double calcularTasaAhorro(Long userId, LocalDateTime inicio, LocalDateTime fin) {
        return savingsRateStrategy.analyze(userId, inicio, fin, transactionService);
    }

}
