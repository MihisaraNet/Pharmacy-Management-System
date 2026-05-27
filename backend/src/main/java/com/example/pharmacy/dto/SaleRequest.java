// src/main/java/com/example/pharmacy/dto/SaleRequest.java
package com.example.pharmacy.dto;

import java.util.List;

public class SaleRequest {
    private List<Long> medicineIds;
    private List<Integer> quantities;

    // Default constructor
    public SaleRequest() {}

    // Parameterized constructor
    public SaleRequest(List<Long> medicineIds, List<Integer> quantities) {
        this.medicineIds = medicineIds;
        this.quantities = quantities;
    }

    // Getters
    public List<Long> getMedicineIds() {
        return medicineIds;
    }

    public List<Integer> getQuantities() {
        return quantities;
    }

    // Setters
    public void setMedicineIds(List<Long> medicineIds) {
        this.medicineIds = medicineIds;
    }

    public void setQuantities(List<Integer> quantities) {
        this.quantities = quantities;
    }

    // Validation helper
    public boolean isValid() {
        return medicineIds != null && quantities != null &&
                !medicineIds.isEmpty() && !quantities.isEmpty() &&
                medicineIds.size() == quantities.size();
    }

    @Override
    public String toString() {
        return "SaleRequest{" +
                "medicineIds=" + medicineIds +
                ", quantities=" + quantities +
                '}';
    }
}
