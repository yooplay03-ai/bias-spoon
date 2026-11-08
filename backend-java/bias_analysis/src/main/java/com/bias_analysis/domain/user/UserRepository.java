package com.bias_analysis.domain.user;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long>{
	Optional<UserEntity> findOneWithAuthoritiesByEmail(String email);
	Optional<UserEntity> findOneWithAuthoritiesByLoginId(String loginId);
	Optional<UserEntity> findByLoginId(String loginId);
	boolean existsByLoginId(String loginId);
	boolean existsByUserNickName(String userNickName);
	long countByCreatedAtAfter(LocalDateTime dateTime);
	long countByStatus(String status); // status가 "BLOCKED"인 유저 등을 셀 때
	List<UserEntity> findTop5ByOrderByCreatedAtDesc();
	Optional<UserEntity> findByEmail(String email);
}
