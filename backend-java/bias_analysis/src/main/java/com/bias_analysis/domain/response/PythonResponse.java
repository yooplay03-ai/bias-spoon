package com.bias_analysis.domain.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PythonResponse {
	private String analysisData;
    private String llmAnalysis;
}
