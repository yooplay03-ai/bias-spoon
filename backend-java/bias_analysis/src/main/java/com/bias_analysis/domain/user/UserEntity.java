package com.bias_analysis.domain.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.auth.AuthorityEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserEntity {
	
	@Id
	@Column(name = "user_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "user_login_id",nullable = false, unique = true, length = 32)
	@NotNull(message = "Login ID entry is required.")
	@Size(min = 4, max = 32)
	private String loginId;
	
	@Column(name = "user_nickname",nullable = false, length = 16)
	@NotNull(message = "Nickname is required")
	@Pattern(regexp = "^[A-Za-z0-9가-힣]+$")
	private String userNickName;
	
	@Column(name = "user_pwd",nullable = false)
	@NotNull(message = "Password entry is required.")
	private String password;
	
	@Column(name = "user_email",unique = true, length = 45)
	@Email
	private String email;
	
	@Column(name = "user_phone",unique = true, length = 45)
	private String phone;
	
	@Column(length = 45)
    @Builder.Default
    private String status = "ACTIVE";
	
	@Column(name = "created_at")
	@CreatedDate
	private LocalDateTime createdAt;
	
	@Column(name = "updated_at")
    @LastModifiedDate
	private LocalDateTime updatedAt;
	
	private LocalDateTime passwordUpdatedAt;
	
//	@Column(nullable = false)
//	@Enumerated(EnumType.STRING)
//	private UserRole role;
	
	@ManyToMany
	@JoinTable(
			name = "user_authority",
			joinColumns = {@JoinColumn(name = "user_id")},
			inverseJoinColumns = {@JoinColumn(name = "authority_name")}
	)
	private Set<AuthorityEntity> authorities;
	
	@OneToMany(mappedBy = "userEntity", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private List<Article> articles;
	
	@OneToMany(mappedBy = "userEntity", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private List<ArticleComment> articleComments;
	
    public void changeNickname(String newNickname) {
        if (newNickname != null && !newNickname.isBlank()) {
            this.userNickName = newNickname;
        }
    }

    public void changeEmail(String newEmail) {
        if (newEmail != null && !newEmail.isBlank()) {
            this.email = newEmail;
        }
    }
	public void changeStatus(String status) {
		this.status = status;
	}
	
	public void changePassword(String password) {
		this.password = password;
		this.passwordUpdatedAt = LocalDateTime.now();
	}
}
