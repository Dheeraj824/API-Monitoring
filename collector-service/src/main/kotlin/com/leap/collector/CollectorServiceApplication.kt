package com.leap.collector

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync

@SpringBootApplication
@EnableAsync
class CollectorServiceApplication

fun main(args: Array<String>) {
	runApplication<CollectorServiceApplication>(*args)
}
