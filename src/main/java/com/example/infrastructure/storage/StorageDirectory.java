package com.example.infrastructure.storage;

public enum StorageDirectory {
    PRODUCTS("products"),
    CUSTOMERS("customers"),
    INVENTORIES("inventories");

    private final String path;

    StorageDirectory(String path) {
        this.path = path;
    }

    public String getPath() {
        return path;
    }
}
