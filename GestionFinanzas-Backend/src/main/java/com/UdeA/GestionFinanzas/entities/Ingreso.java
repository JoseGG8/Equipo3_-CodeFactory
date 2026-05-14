package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("INGRESO")
public class Ingreso extends Transaction {
    
    @Override
    public Double getImpactoFinanciero() {
        return this.getMonto();
    }
}
