package com.leap.tracking.interceptor

import com.leap.tracking.service.RateLimiterService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.util.ContentCachingRequestWrapper
import org.springframework.web.util.ContentCachingResponseWrapper
import java.time.Instant

@Component
class TrackingInterceptor(
    private val rateLimiterService: RateLimiterService,
    private val logSenderService: com.leap.tracking.service.LogSenderService,
    @Value("\${spring.application.name:unknown-service}") private val serviceName: String
) : HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(TrackingInterceptor::class.java)

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        request.setAttribute("startTime", Instant.now())
        
        if (!rateLimiterService.allowRequest(serviceName)) {
            logger.warn("Rate limit hit for service: $serviceName")
            request.setAttribute("rateLimitHit", true)
        }
        
        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        val startTime = request.getAttribute("startTime") as Instant
        val endTime = Instant.now()
        val latency = java.time.Duration.between(startTime, endTime).toMillis()
        
        val rateLimitHit = request.getAttribute("rateLimitHit") as? Boolean ?: false
        
        // In a real scenario, we might need wrappers to get size, but standard request/response 
        // objects don't always give content size easily if not wrapped. 
        // For simplicity, we'll use content-length header or 0.
        val requestSize = request.contentLengthLong
        val responseSize = response.getHeader("Content-Length")?.toLongOrNull() ?: 0L

        val logEntry = mapOf(
            "serviceName" to serviceName,
            "endpoint" to request.requestURI,
            "method" to request.method,
            "status" to response.status,
            "requestSize" to requestSize,
            "responseSize" to responseSize,
            "latency" to latency,
            "timestamp" to endTime.toString(),
            "rateLimitHit" to rateLimitHit
        )

        // Send to Collector Service asynchronously
        logSenderService.sendLog(logEntry)
        logger.info("API Log: $logEntry")
    }
}
