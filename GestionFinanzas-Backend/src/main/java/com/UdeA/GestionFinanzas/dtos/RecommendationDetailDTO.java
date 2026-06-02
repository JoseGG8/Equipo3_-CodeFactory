package com.UdeA.GestionFinanzas.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDetailDTO {
    private String type; // e.g. "CRITICA", "ADVERTENCIA", "INFO"
    private String message;
}
