package com.bias_analysis.domain.article_comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
//DB에 접근하기 위한 데이터 베이스
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleCommentRepository extends JpaRepository<ArticleComment, Long>{
	//특정 게시글의 모든 댓글 조회!
	List<ArticleComment> findByArticle_Id(Long articleId);

	@Query("select c from ArticleComment c where c.parent.id in :parentIds order by createdAt asc")
	List<ArticleComment> findByParentIdInOrderByCreatedAtAsc(@Param("parentIds")List<Long> parentIds);
	
	Page<ArticleComment> findByArticleIdAndParentIdIsNull(Long articleId, Pageable pageable);
	
	@Modifying(clearAutomatically = true)
    @Query("UPDATE ArticleComment c SET c.commentLikeCount = c.commentLikeCount + 1 WHERE c.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE ArticleComment c SET c.commentLikeCount = c.commentLikeCount - 1 WHERE c.id = :id AND c.commentLikeCount > 0")
    void decrementLikeCount(@Param("id") Long id);
    
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ArticleComment c SET c.commentLikeCount = :realCount WHERE c.id = :id")
    void updateLikeCountManually(@Param("id") Long id, @Param("realCount") long realCount);
    
    Integer countByArticleIdAndStatusNot(Long articleId, String status);
    
    @EntityGraph(attributePaths = {"article"})
    Page<ArticleComment> findByUserEntity_LoginId(String loginId, Pageable pageable);
    
    Page<ArticleComment> findAllByStatus(String status, Pageable pageable);
    
    @Modifying
	@Query("UPDATE ArticleComment c SET c.status = 'ACTIVE' WHERE c.id IN :ids")
	void restoreCommentsByIds(@Param("ids") List<Long> ids);
    
    long countByStatus(String status);
    List<ArticleComment> findTop5ByStatusOrderByUpdatedAtDesc(String status);
}
