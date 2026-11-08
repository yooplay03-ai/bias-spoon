package com.bias_analysis.domain.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
	
	@NotBlank(message = "Login ID entry is required.")
    @Size(min = 4, max = 32, message = "Login ID must be between 4 and 32 characters.")
    private String loginId;
	
	@NotBlank(message = "Nickname is required")
    @Pattern(regexp = "^[A-Za-z0-9가-힣]+$", message = "Nickname can only contain letters and numbers.")
    private String userNickName;
	
	@Email(message = "Invalid email format.")
	private String email;
	
	@NotBlank(message = "Password entry is required.")
	private String password;
}
