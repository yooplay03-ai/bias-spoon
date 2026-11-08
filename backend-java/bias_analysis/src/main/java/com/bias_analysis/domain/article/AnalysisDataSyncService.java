package com.bias_analysis.domain.article;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisDataSyncService {
	private final JdbcTemplate jdbcTemplate;
	
	public Map<String, String> fetchPythonData(String uuid) {
		Map<String, String> map = new HashMap<>();
		try {
			log.info("[Sync] 조회 시작 -> UUID: {}", uuid);
			
			String sql1 = "SELECT data FROM bias_analysis_summary WHERE uuid = ?";
	        String data1 = jdbcTemplate.queryForObject(sql1, String.class, uuid);
	        map.put("analysisData", data1);

	        String sql2 = "SELECT data FROM analysis_result WHERE uuid = ?";
	        String data2 = jdbcTemplate.queryForObject(sql2, String.class, uuid);
	        map.put("llmAnalysis", data2);
	        
		} catch (EmptyResultDataAccessException e) {
			log.error("[Sync] 해당 UUID({})에 대한 분석 데이터를 찾을 수 없습니다.", uuid);
			map.put("analysisData", "[]");
			map.put("llmAnalysis", "분석 데이터가 존재하지 않습니다.");
		}
		
		return map;
	}
}
