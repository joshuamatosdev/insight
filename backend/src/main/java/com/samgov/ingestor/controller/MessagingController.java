package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.MessageDTO;
import com.samgov.ingestor.dto.MessageThreadDTO;
import com.samgov.ingestor.dto.SendMessageRequest;
import com.samgov.ingestor.dto.ThreadWithMessagesDTO;
import com.samgov.ingestor.service.MessagingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class MessagingController {

    private final MessagingService messagingService;

    /**
     * List all message threads for the current user.
     */
    @GetMapping("/threads")
    public ResponseEntity<Page<MessageThreadDTO>> getThreads(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageThreadDTO> threads = messagingService.getThreads(pageable);
        return ResponseEntity.ok(threads);
    }

    /**
     * Get a specific thread with all its messages.
     */
    @GetMapping("/threads/{id}")
    public ResponseEntity<ThreadWithMessagesDTO> getThread(@PathVariable UUID id) {
        ThreadWithMessagesDTO thread = messagingService.getThread(id);
        return ResponseEntity.ok(thread);
    }

    /**
     * Get messages in a thread with pagination.
     */
    @GetMapping("/threads/{id}/messages")
    public ResponseEntity<Page<MessageDTO>> getMessages(
        @PathVariable UUID id,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = messagingService.getMessages(id, pageable);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a new message (creates thread if needed).
     */
    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageDTO message = messagingService.sendMessage(request);
        return ResponseEntity.ok(message);
    }

    /**
     * Reply to an existing thread.
     */
    @PostMapping("/threads/{id}/reply")
    public ResponseEntity<MessageDTO> replyToThread(
        @PathVariable UUID id,
        @Valid @RequestBody ReplyRequest request
    ) {
        MessageDTO message = messagingService.replyToThread(id, request.content());
        return ResponseEntity.ok(message);
    }

    /**
     * Mark a message as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        messagingService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark all messages in a thread as read.
     */
    @PutMapping("/threads/{id}/read")
    public ResponseEntity<Void> markThreadAsRead(@PathVariable UUID id) {
        messagingService.markThreadAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Get the count of unread messages for the current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount() {
        long count = messagingService.getUnreadCount();
        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    /**
     * Delete a thread (soft delete).
     */
    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable UUID id) {
        messagingService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search messages by content.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<MessageDTO>> searchMessages(
        @RequestParam String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = messagingService.searchMessages(query, pageable);
        return ResponseEntity.ok(messages);
    }

    /**
     * Request body for replying to a thread.
     */
    public record ReplyRequest(
        @NotBlank(message = "Content is required")
        String content
    ) {}

    /**
     * Response for unread count.
     */
    public record UnreadCountResponse(long count) {}
}
