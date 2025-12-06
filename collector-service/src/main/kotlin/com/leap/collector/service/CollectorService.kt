package com.leap.collector.service

import com.leap.collector.model.Alert
import com.leap.collector.model.AlertType
import com.leap.collector.model.ApiLog
import com.leap.collector.repository.logs.ApiLogRepository
import com.leap.collector.repository.metadata.AlertRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class CollectorService(
    private val apiLogRepository: ApiLogRepository,
    private val alertRepository: AlertRepository,
    @Value("\${monitoring.alert.latency-threshold:500}") private val latencyThreshold: Long
) {

    @Async
    fun processLog(logData: Map<String, Any>) {
        val apiLog = mapToApiLog(logData)
        apiLogRepository.save(apiLog)
        
        checkAndCreateAlerts(apiLog)
    }

    private fun mapToApiLog(data: Map<String, Any>): ApiLog {
        return ApiLog(
            serviceName = data["serviceName"] as String,
            endpoint = data["endpoint"] as String,
            method = data["method"] as String,
            status = (data["status"] as Int),
            requestSize = (data["requestSize"] as Number).toLong(),
            responseSize = (data["responseSize"] as Number).toLong(),
            latency = (data["latency"] as Number).toLong(),
            timestamp = Instant.parse(data["timestamp"] as String),
            rateLimitHit = data["rateLimitHit"] as Boolean
        )
    }

    private fun checkAndCreateAlerts(log: ApiLog) {
        if (log.latency > latencyThreshold) {
            createAlert(log.serviceName, AlertType.HIGH_LATENCY, "Latency ${log.latency}ms exceeded threshold")
        }
        
        if (log.status >= 500) {
            createAlert(log.serviceName, AlertType.ERROR_STATUS, "Error status ${log.status} detected")
        }
        
        if (log.rateLimitHit) {
            createAlert(log.serviceName, AlertType.RATE_LIMIT_EXCEEDED, "Rate limit exceeded")
        }
    }

    private fun createAlert(serviceName: String, type: AlertType, message: String) {
        val alert = Alert(
            serviceName = serviceName,
            type = type,
            message = message,
            timestamp = Instant.now()
        )
        alertRepository.save(alert)
    }
}
