package com.bias_analysis.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {
	
	@Bean
	public OpenAPI openAPI() {
		String jwtSchemeName = "jwtAuth";
		
		SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
		
		SecurityScheme securityScheme = new SecurityScheme()
				.name(jwtSchemeName)
				.type(SecurityScheme.Type.HTTP)
				.scheme("bearer")
				.bearerFormat("JWT");
		
		return new OpenAPI()
				.info(new Info().title("My Project API").version("1.0"))
				.addSecurityItem(securityRequirement)
				.components(new Components().addSecuritySchemes(jwtSchemeName, securityScheme));
	}
}
