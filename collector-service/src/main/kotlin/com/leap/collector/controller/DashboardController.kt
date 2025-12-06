package com.leap.collector.controller

import com.leap.collector.model.Alert
import com.leap.collector.model.ApiLog
import com.leap.collector.repository.logs.ApiLogRepository
import com.leap.collector.repository.metadata.AlertRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = ["*"]) // Allow Next.js to access
class DashboardController(
    private val apiLogRepository: ApiLogRepository,
    private val alertRepository: AlertRepository,
    private val serviceMetadataRepository: com.leap.collector.repository.metadata.ServiceMetadataRepository,
    @org.springframework.beans.factory.annotation.Qualifier("primaryMongoTemplate") private val mongoTemplate: org.springframework.data.mongodb.core.MongoTemplate
) {

    @GetMapping("/logs")
    fun getLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) serviceName: String?
    ): org.springframework.data.domain.Page<ApiLog> {
        val pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp")
        )
        
        return if (serviceName != null) {
            apiLogRepository.findByServiceName(serviceName, pageable)
        } else {
            apiLogRepository.findAll(pageable)
        }
    }

    @GetMapping("/services")
    fun getServices(): List<String> {
        return mongoTemplate.query(ApiLog::class.java)
            .distinct("serviceName")
            .`as`(String::class.java)
            .all()
    }

    @GetMapping("/alerts")
    fun getAlerts(): List<Alert> {
        return alertRepository.findAll()
    }
    
    @GetMapping("/stats")
    fun getStats(): Map<String, Any> {
        val logs = apiLogRepository.findAll()
        val alerts = alertRepository.findAll()
        
        if (logs.isEmpty()) {
            return mapOf(
                "totalLogs" to 0,
                "slowApis" to 0,
                "brokenApis" to 0,
                "rateLimitHits" to 0,
                "activeAlerts" to 0
            )   
        }

        val slowApis = logs.count { it.latency > 500 }
        val brokenApis = logs.count { it.status >= 500 }
        val rateLimitHits = logs.count { it.rateLimitHit }
        
        return mapOf(
            "totalLogs" to logs.size,
            "slowApis" to slowApis,
            "brokenApis" to brokenApis,
            "rateLimitHits" to rateLimitHits,
            "activeAlerts" to alerts.count { !it.resolved }
        )
    }
    
    @PostMapping("/alerts/{id}/resolve")
    fun resolveAlert(@PathVariable id: String, @RequestParam resolvedBy: String) {
        val alert = alertRepository.findById(id).orElseThrow { RuntimeException("Alert not found") }
        val updatedAlert = alert.copy(
            resolved = true,
            resolvedBy = resolvedBy,
            resolvedAt = java.time.Instant.now()
        )
        alertRepository.save(updatedAlert)
    }

    @GetMapping("/services/{serviceName}")
    fun getServiceMetadata(@PathVariable serviceName: String): com.leap.collector.model.ServiceMetadata {
        return serviceMetadataRepository.findById(serviceName)
            .orElse(com.leap.collector.model.ServiceMetadata(serviceName, 100)) // Default limit 100
    }

    @PostMapping("/services/{serviceName}/rate-limit")
    fun updateRateLimit(@PathVariable serviceName: String, @RequestParam limit: Long) {
        val metadata = serviceMetadataRepository.findById(serviceName)
            .orElse(com.leap.collector.model.ServiceMetadata(serviceName, limit))
        
        val updatedMetadata = metadata.copy(rateLimit = limit)
        serviceMetadataRepository.save(updatedMetadata)
    }
}
