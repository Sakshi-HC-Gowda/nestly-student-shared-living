package com.nestly.nestly_backend.exception;

import java.util.Map;

public class ValidationErrorResponse {

    private String message;
    private Map<String, String> errors;

    public ValidationErrorResponse(
            String message,
            Map<String, String> errors) {

        this.message = message;
        this.errors = errors;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}