package com.bias_analysis.domain.article_like;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.bias_analysis.domain.article.Article;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "article_like")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ArticleLikeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_like_id")
    private Long articleLikeId;

    // 어떤 글을 좋아요 했는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private Article article;

    private Long userId;

    // 자동 생성
    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime articleLikeCreatedAt;

    // 자동 수정
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime articleLikeUpdatedAt;
}