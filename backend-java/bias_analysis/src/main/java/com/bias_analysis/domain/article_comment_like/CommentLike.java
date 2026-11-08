package com.bias_analysis.domain.article_comment_like;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.bias_analysis.domain.article_comment.ArticleComment;

import java.time.LocalDateTime;

@Entity
@Table(
	    name = "comment_like",
	    uniqueConstraints = {
	        @UniqueConstraint(
	            name = "uk_comment_user",
	            columnNames = {"article_comment_id", "userId"}
	        )
	    }
	)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class) // 생성일 자동 입력을 위해 필요
public class CommentLike {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long commentLikeId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "article_comment_id")
	private ArticleComment articleComment;

	private Long userId;

	@CreatedDate
	@Column(updatable = false)
	private LocalDateTime createdAt;
}