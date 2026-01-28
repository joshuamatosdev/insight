package com.samgov.ingestor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public RateLimitExceededException() {
        super("Rate limit exceeded. Please try again later.");
        this.retryAfterSeconds = 60;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
