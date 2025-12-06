package com.leap.collector.model

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Version
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "service_metadata")
data class ServiceMetadata(
    @Id
    val serviceName: String,
    val rateLimit: Long,
    val owner: String? = null,
    
    @Version
    val version: Long? = null
)
