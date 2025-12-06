package com.leap.tracking.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class LogSenderService(
    @Value("\${monitoring.collector.url}") private val collectorUrl: String
) {
    private val logger = LoggerFactory.getLogger(LogSenderService::class.java)
    private val restTemplate = RestTemplate()

    @Async
    fun sendLog(logEntry: Map<String, Any>) {
        try {
            restTemplate.postForEntity("$collectorUrl/logs", logEntry, Void::class.java)
        } catch (e: Exception) {
            logger.error("Failed to send log to collector: ${e.message}")
        }
    }

    fun fetchServiceMetadata(serviceName: String): com.leap.tracking.model.ServiceMetadata? {
        return try {
            restTemplate.getForObject(
                "$collectorUrl/dashboard/services/$serviceName",
                com.leap.tracking.model.ServiceMetadata::class.java
            )
        } catch (e: Exception) {
            logger.error("Failed to fetch service metadata: ${e.message}")
            null
        }
    }
}
