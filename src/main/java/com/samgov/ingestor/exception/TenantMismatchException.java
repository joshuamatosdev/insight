package com.samgov.ingestor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class TenantMismatchException extends RuntimeException {

    public TenantMismatchException(String resourceType) {
        super(String.format("%s does not belong to current tenant", resourceType));
    }

    public TenantMismatchException() {
        super("Resource does not belong to current tenant");
    }
}
