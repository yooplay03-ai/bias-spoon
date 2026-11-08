package com.bias_analysis.domain.article_comment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.user.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "article_comment")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ArticleComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_comment_id")
    private Long id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Builder.Default
    @Column(name = "like_count", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Integer commentLikeCount = 0;
    
    @Builder.Default
    @Column(name = "report_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer reportCount = 0;
    
    private boolean isAnonymous;
    private boolean isSecret;

    private String status; // ACTIVE, HIDDEN, DELETED << 나중에 enum 처리
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt; // SQL과 이름 통일
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    @JsonIgnore
    private Article article;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity userEntity;
   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ArticleComment parent;
    
    public void commentUpdate(String content, boolean isAnonymous, boolean isSecret) {
    	this.content = content;
    	this.isAnonymous = isAnonymous;
    	this.isSecret = isSecret;
    }
    
    public void statusChange(String status) {
    	this.status = status;
    }
}