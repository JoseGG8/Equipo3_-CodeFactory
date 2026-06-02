package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.dtos.*;
import com.UdeA.GestionFinanzas.entities.Budget;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import com.UdeA.GestionFinanzas.repositories.BudgetRepository;
import com.UdeA.GestionFinanzas.repositories.TransactionRepository;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private FinancialAnalysisService financialAnalysisService;

    public CategoryReportDTO getCategoryReport(Long userId, Integer year, Integer month) {
        validarUsuario(userId);

        YearMonth targetMonth = getYearMonth(year, month);
        LocalDateTime inicio = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime fin = targetMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<CategorySumDTO> sumList = transactionRepository.sumExpensesByCategory(userId, TransactionType.GASTO, inicio, fin);

        if (sumList.isEmpty()) {
            return new CategoryReportDTO(0.0, new ArrayList<>());
        }

        double totalMonthExpense = sumList.stream().mapToDouble(CategorySumDTO::getTotalAmount).sum();

        List<CategoryDetailDTO> categories = sumList.stream().map(sum -> {
            double percentage = (sum.getTotalAmount() * 100.0) / totalMonthExpense;
            // Redondear a 2 decimales para evitar problemas de precisión
            percentage = Math.round(percentage * 100.0) / 100.0;
            return new CategoryDetailDTO(sum.getCategoryName(), sum.getTotalAmount(), percentage);
        }).collect(Collectors.toList());

        return new CategoryReportDTO(totalMonthExpense, categories);
    }

    public FinancialRecommendationsDTO getRecommendations(Long userId, Integer year, Integer month) {
        validarUsuario(userId);

        YearMonth targetMonth = getYearMonth(year, month);
        LocalDateTime inicio = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime fin = targetMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<RecommendationDetailDTO> recommendations = new ArrayList<>();

        // CA1: Regla del >60%
        List<CategorySumDTO> sumList = transactionRepository.sumExpensesByCategory(userId, TransactionType.GASTO, inicio, fin);
        double totalMonthExpense = sumList.stream().mapToDouble(CategorySumDTO::getTotalAmount).sum();

        if (totalMonthExpense > 0) {
            for (CategorySumDTO sum : sumList) {
                double percentage = (sum.getTotalAmount() * 100.0) / totalMonthExpense;
                if (percentage > 60.0) {
                    recommendations.add(new RecommendationDetailDTO(
                            "ADVERTENCIA",
                            String.format("La categoría '%s' representa más del 60%% de tus gastos (%.2f%%). Tu gasto más alto en esta categoría fue de %.2f. Considera reducir este rubro.",
                                    sum.getCategoryName(), percentage, sum.getMaxExpenseAmount())
                    ));
                }
            }
        }

        // CA3: Regla de Presupuesto Excedido
        Optional<Budget> budgetOpt = budgetRepository.findByUsuarioIdAndMesAndAño(userId, targetMonth.getMonthValue(), targetMonth.getYear());
        if (budgetOpt.isPresent()) {
            Double presupuesto = budgetOpt.get().getMontoTotal();
            if (totalMonthExpense > presupuesto) {
                recommendations.add(new RecommendationDetailDTO(
                        "CRITICA",
                        String.format("Has excedido tu presupuesto mensual. Presupuesto: %.2f, Gasto Total: %.2f. Revisa tus gastos por categoría inmediatamente.",
                                presupuesto, totalMonthExpense)
                ));
            }
        }

        // CA2: Regla de Cierre de Mes sin Ahorro (Mes anterior)
        YearMonth previousMonth = targetMonth.minusMonths(1);
        LocalDateTime inicioAnt = previousMonth.atDay(1).atStartOfDay();
        LocalDateTime finAnt = previousMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

        try {
            Double balanceAnterior = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicioAnt, finAnt);
            if (balanceAnterior <= 0) {
                recommendations.add(new RecommendationDetailDTO(
                        "INFO",
                        "El mes anterior no lograste un saldo positivo. Te sugerimos establecer una meta de ahorro para este mes y mover fondos tan pronto recibas ingresos."
                ));
            }
        } catch (Exception e) {
            // Si el servicio falla o no hay datos suficientes del mes anterior, se ignora esta recomendación
        }

        return new FinancialRecommendationsDTO(recommendations);
    }

    private void validarUsuario(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
    }

    private YearMonth getYearMonth(Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int y = (year != null) ? year : now.getYear();
        int m = (month != null) ? month : now.getMonthValue();
        return YearMonth.of(y, m);
    }
}
