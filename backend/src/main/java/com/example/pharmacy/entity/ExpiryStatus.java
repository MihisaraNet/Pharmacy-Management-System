package com.example.pharmacy.entity;

public enum ExpiryStatus {
    ACTIVE("Active"),
    EXPIRED("Expired"),
    EXPIRING_SOON("Expiring Soon"),
    DISPOSED("Disposed"),
    RECALLED("Recalled");

    private final String displayName;

    ExpiryStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}