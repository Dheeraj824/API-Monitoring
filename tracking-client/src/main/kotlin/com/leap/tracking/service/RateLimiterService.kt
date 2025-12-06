package com.leap.tracking.service

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import io.github.bucket4j.Refill
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

@Service
class RateLimiterService(
    @Value("\${monitoring.rateLimit.limit:100}") private var currentLimit: Long,
    @Value("\${spring.application.name:unknown-service}") private val serviceName: String,
    private val logSenderService: com.leap.tracking.service.LogSenderService
) {
    private val buckets = ConcurrentHashMap<String, Bucket>()
    private val logger = org.slf4j.LoggerFactory.getLogger(RateLimiterService::class.java)

    // Poll every 30 seconds
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 30000)
    fun updateRateLimit() {
        val metadata = logSenderService.fetchServiceMetadata(serviceName)
        if (metadata != null && metadata.rateLimit != currentLimit) {
            logger.info("Updating rate limit for $serviceName from $currentLimit to ${metadata.rateLimit}")
            currentLimit = metadata.rateLimit
            // Re-create bucket with new limit
            buckets[serviceName] = createNewBucket()
        }
    }

    fun allowRequest(serviceName: String): Boolean {
        val bucket = buckets.computeIfAbsent(serviceName) { _ ->
            createNewBucket()
        }
        return bucket.tryConsume(1)
    }

    private fun createNewBucket(): Bucket {
        // Refill.greedy is deprecated, using builder or standard refill
        val limit = Bandwidth.builder()
            .capacity(currentLimit)
            .refillGreedy(currentLimit, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(limit).build()
    }
}
