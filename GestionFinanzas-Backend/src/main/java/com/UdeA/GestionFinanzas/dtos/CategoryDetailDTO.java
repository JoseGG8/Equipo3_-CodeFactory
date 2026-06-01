package com.UdeA.GestionFinanzas.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDetailDTO {
    private String categoryName;
    private Double subtotal;
    private Double percentage;
}
