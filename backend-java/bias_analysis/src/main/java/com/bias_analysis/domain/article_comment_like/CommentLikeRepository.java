package com.bias_analysis.domain.article_comment_like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.article_comment.ArticleComment;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
	// 특정 사용자가 특정 댓글에 좋아요를 눌렀는지 확인하는 용도
	Optional<CommentLike> findByArticleCommentAndUserId(ArticleComment articleComment, Long userId);


    // 특정 댓글의 총 좋아요 수 조회
	Integer countByArticleCommentId(Long commentId);


	boolean existsByArticleCommentIdAndUserId(Long commentId, Long userId);

	@Modifying
	@Transactional
	void deleteByArticleCommentIdAndUserId(Long commentId, Long userId);


}