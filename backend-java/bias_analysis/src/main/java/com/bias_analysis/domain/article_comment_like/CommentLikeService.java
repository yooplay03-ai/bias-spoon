package com.bias_analysis.domain.article_comment_like;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.article_comment.ArticleCommentRepository;
import com.bias_analysis.domain.user.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentLikeService {

	private final CommentLikeRepository commentLikeRepository;
	private final ArticleCommentRepository articleCommentRepository;
	private final UserRepository userRepository;

	@Transactional
	public void addLike(Long commentId, String loginId) {
		Long userId = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
				.getId();
		log.info("Service addLike - userId: {}, commentId: {}", userId, commentId);
		if (!commentLikeRepository.existsByArticleCommentIdAndUserId(commentId, userId)) {

			// 2. 댓글 엔티티 조회 (연관관계 매핑을 위해 필요)
			ArticleComment comment = articleCommentRepository.findById(commentId)
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

			CommentLike commentLike = CommentLike.builder()
					.articleComment(comment) // ID 대신 객체를 넣음
					.userId(userId)
					.build();
			
			commentLikeRepository.save(commentLike);
			
			articleCommentRepository.incrementLikeCount(commentId);
			log.info("CommentLike 저장 완료");
		} else {
			log.warn("이미 좋아요가 존재하여 저장을 건너뜁니다.");
		}
	}

	@Transactional
	public void removeLike(Long commentId, String loginId) {
		Long userId = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
				.getId();
		commentLikeRepository.deleteByArticleCommentIdAndUserId(commentId, userId);
		
		articleCommentRepository.decrementLikeCount(commentId);
	}

	@Transactional(readOnly = true)
	public CommentLikeStatusDTO getCommentLikeStatus(Long commentId, String loginId) {
		Long userId = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
				.getId();
		boolean likedByMe = commentLikeRepository.existsByArticleCommentIdAndUserId(commentId, userId);
		Integer count = commentLikeRepository.countByArticleCommentId(commentId);

		return CommentLikeStatusDTO.builder()
				.commentId(commentId)
				.likedByMe(likedByMe)
				.commentLikeCount(count)
				.build();
	}

}