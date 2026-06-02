package com.UdeA.GestionFinanzas.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryReportDTO {
    private Double totalMonthExpense;
    private List<CategoryDetailDTO> categories;
}
