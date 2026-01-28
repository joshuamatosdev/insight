package com.samgov.ingestor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateEntityException extends RuntimeException {

    private final String entityType;
    private final String fieldName;
    private final String fieldValue;

    public DuplicateEntityException(String entityType, String fieldName, String fieldValue) {
        super(String.format("%s already exists with %s: %s", entityType, fieldName, fieldValue));
        this.entityType = entityType;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public DuplicateEntityException(String message) {
        super(message);
        this.entityType = null;
        this.fieldName = null;
        this.fieldValue = null;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getFieldName() {
        return fieldName;
    }

    public String getFieldValue() {
        return fieldValue;
    }
}
