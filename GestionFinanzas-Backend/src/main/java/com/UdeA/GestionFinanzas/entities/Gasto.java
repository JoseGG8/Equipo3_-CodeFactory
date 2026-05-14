package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("GASTO")
public class Gasto extends Transaction {
    
    @Override
    public Double getImpactoFinanciero() {
        return -this.getMonto();
    }
}
