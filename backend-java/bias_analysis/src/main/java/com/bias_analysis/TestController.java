package com.bias_analysis;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {
	
	@GetMapping("/")
	@ResponseBody
	public String index() {
		return "1sdfgasdfgasd";
	}
}
