package com.UdeA.GestionFinanzas.dtos;

import lombok.Data;

@Data
public class BudgetProgressDTO {
    private Long id;
    private String nombre;
    private Double montoTotal;
    private Double montoGastado;
    private Double porcentaje;
}
