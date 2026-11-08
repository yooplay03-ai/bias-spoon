package com.bias_analysis.domain.profile;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileEditRequestDTO {
	
	@JsonProperty("userNickName")
	@Pattern(regexp = "^[A-Za-z0-9가-힣]+$", message = "특수문자는 사용할 수 없습니다.")
	private String nickname;
	
	@Email
	private String email;
	
}
