package com.voltwise.core.home.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomeRepository extends JpaRepository<Home, Long> {

    List<Home> findAllByOrderByIdAsc();

    List<Home> findByContactEmailIgnoreCase(String contactEmail);
}
