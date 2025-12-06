package com.leap.collector.repository.logs

import com.leap.collector.model.ApiLog
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.Instant

@Repository
interface ApiLogRepository : MongoRepository<ApiLog, String> {
    fun findByServiceName(serviceName: String, pageable: Pageable): Page<ApiLog>
    fun findByTimestampBetween(start: Instant, end: Instant): List<ApiLog>
    fun findByLatencyGreaterThan(latency: Long): List<ApiLog>
    fun findByStatusGreaterThanEqual(status: Int): List<ApiLog>

}
