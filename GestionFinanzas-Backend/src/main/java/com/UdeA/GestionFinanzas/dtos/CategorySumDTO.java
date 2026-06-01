package com.UdeA.GestionFinanzas.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySumDTO {
    private String categoryName;
    private Double totalAmount;
    private Double maxExpenseAmount;
}
