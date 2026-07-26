package com.voltwise.core.home.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Notification> findByHomeIdOrderByCreatedAtDesc(Long homeId, Pageable pageable);

    @Modifying
    @Query("update Notification n set n.read = true where n.read = false and (:homeId is null or n.homeId = :homeId)")
    int markAllRead(Long homeId);
}
