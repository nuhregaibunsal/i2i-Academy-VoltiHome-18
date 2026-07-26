package com.voltwise.core.home.service;

import com.voltwise.core.common.exception.ResourceNotFoundException;
import com.voltwise.core.common.web.PagedResponse;
import com.voltwise.core.home.domain.Notification;
import com.voltwise.core.home.domain.NotificationRepository;
import com.voltwise.core.home.dto.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> list(Long homeId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Notification> result = (homeId != null)
                ? notificationRepository.findByHomeIdOrderByCreatedAtDesc(homeId, pageable)
                : notificationRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.of(result, result.getContent().stream().map(this::toResponse).toList());
    }

    @Transactional
    public void markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification " + id + " not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long homeId) {
        notificationRepository.markAllRead(homeId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getHomeId(), n.getHomeName(), n.getType().name(),
                n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
