package com.manfashion.springboot_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpringbootBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringbootBeApplication.class, args);
	}

}
