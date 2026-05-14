package com.UdeA.GestionFinanzas.dtos;

import com.UdeA.GestionFinanzas.entities.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private String nombreUsuario;
    private Double balanceTotal;
    private Double tasaAhorro;
    private List<Transaction> ultimasTransacciones;
}
