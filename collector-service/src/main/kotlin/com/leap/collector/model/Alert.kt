package com.leap.collector.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "alerts")
data class Alert(
    @Id
    val id: String? = null,
    val serviceName: String,
    val type: AlertType,
    val message: String,
    val timestamp: Instant,
    val resolved: Boolean = false,
    val resolvedBy: String? = null,
    val resolvedAt: Instant? = null,
    
    @org.springframework.data.annotation.Version
    val version: Long? = null
)

enum class AlertType {
    HIGH_LATENCY,
    ERROR_STATUS,
    RATE_LIMIT_EXCEEDED
}
