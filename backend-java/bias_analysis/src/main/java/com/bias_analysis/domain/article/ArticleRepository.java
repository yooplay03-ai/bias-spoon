package com.bias_analysis.domain.article;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<Article, Long> {
	// 카테고리별 페이징처리
	@Query("SELECT a FROM Article a WHERE (:category = '' OR a.category = :category) AND a.status = 'ACTIVE'")
	Page<Article> findByCategoryIgnoreCase(@Param("category") String category, Pageable pageable);

	boolean existsByIdAndStatusNot(Long id, String status);

	@Modifying(clearAutomatically = true)
	@Query("UPDATE Article a SET a.articleLikeCount = a.articleLikeCount + 1 WHERE a.id = :id")
	void incrementLikeCount(@Param("id") Long id);

	@Modifying(clearAutomatically = true)
	@Query("UPDATE Article a SET a.articleLikeCount = a.articleLikeCount - 1 WHERE a.id = :id AND a.articleLikeCount > 0")
	void decrementLikeCount(@Param("id") Long id);

	@Modifying(clearAutomatically = true)
	@Query("UPDATE Article a SET a.articleLikeCount = :realCount WHERE a.id = :id")
	void updateLikeCountManually(@Param("id") Long id, @Param("realCount") long realCount);

	@Modifying(clearAutomatically = true)
	@Query("UPDATE Article a SET a.commentCount = :realCount WHERE a.id = :id")
	void updateCommentCountManually(@Param("id") Long id, @Param("realCount") long realCount);

	@Query(value = "SELECT a FROM Article a JOIN FETCH a.userEntity u "
			+ "WHERE (:category = '' OR a.category = :category) AND a.status = 'ACTIVE' AND ("
			+ "(:type = 'all' AND (LOWER(a.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR "
			+ "(:type = 'title' AND LOWER(a.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
			+ "(:type = 'content' AND LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
			+ "(:type = 'author' AND LOWER(u.userNickName) LIKE LOWER(CONCAT('%', :keyword, '%'))))",
			countQuery = "SELECT count(a) FROM Article a JOIN a.userEntity u "
					+ "WHERE a.category = :category AND a.status = 'ACTIVE' AND ("
					+ "(:type = 'all' AND (LOWER(a.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR "
					+ "(:type = 'title' AND LOWER(a.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
					+ "(:type = 'content' AND LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
					+ "(:type = 'author' AND LOWER(u.userNickName) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
	Page<Article> searchArticles(@Param("category") String category, @Param("type") String type,
			@Param("keyword") String keyword, Pageable pageable);

	@EntityGraph(attributePaths = { "userEntity" })
	Page<Article> findByUserEntity_LoginIdAndStatus(String loginId, String status, Pageable pageable);
	
	Page<Article> findAllByStatus(String status, Pageable pageable);
	
	@Modifying
	@Query("UPDATE Article a SET a.status = 'ACTIVE' WHERE a.id IN :ids")
	void restoreArticlesByIds(@Param("ids") List<Long> ids);
	
	long countByStatus(String status);
	List<Article> findTop5ByStatusOrderByUpdatedAtDesc(String status);
}
