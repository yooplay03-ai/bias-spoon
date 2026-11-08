package com.bias_analysis.domain.article;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.user.UserEntity;

@Entity
@Table(name = "article")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB가 AUTO_INCREMENT일 때
    @Column(name = "article_id")
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false, length = 45)
    private String subject;


    @Column(name = "category", length = 45)
    private String category;

    @Column(length = 45)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(nullable = false)
    @Builder.Default
    private Integer hitcount = 0;
    
    @Builder.Default
    @Column(name = "like_count", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Integer articleLikeCount = 0;
    
    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL)
    private List<ArticleComment> articleComment;
    
    @Builder.Default
    @Column(name = "comment_count", nullable = false)
    private Integer commentCount = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity userEntity;
    
    @Column(name = "python_analysis_id")
    private String pythonAnalysisId; // 파이썬 DB의 원본 데이터 ID
    
    @Column(columnDefinition = "LONGTEXT")
    private String analysisData; // 파이썬에서 넘어온 JSON 데이터
    
    @Column(columnDefinition = "TEXT")
    private String llmAnalysis; // 파이썬에서 넘어온 분석 코멘트
    
    public void update(String subject, String content, String category, String status) {
        this.subject = subject;
        this.content = content;
        this.category = category;
        this.status = status;
    }
    
    public void increaseHitCount() {
    	if (this.hitcount == null) {
    		this.hitcount = 0;
    	}
    	++this.hitcount;
    }
    
    public void addCommentCount() {
    	++this.commentCount;
    }
    
    public void subCommentCount() {
    	if (this.commentCount > 0) --this.commentCount;
    }
}
