package com.leap.collector.repository.metadata

import com.leap.collector.model.Alert
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface AlertRepository : MongoRepository<Alert, String> {
    fun findByResolvedFalse(): List<Alert>
    fun findByTimestampAfter(timestamp: Instant): List<Alert>
}
