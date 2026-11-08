package com.bias_analysis.domain.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Getter
@Table(name = "authority")
public class AuthorityEntity {
	@Id
	@Column(name = "authority_name", length=50)
	private String authorityName;
}
