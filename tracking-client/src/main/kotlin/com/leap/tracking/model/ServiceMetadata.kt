package com.leap.tracking.model

data class ServiceMetadata(
    val serviceName: String,
    val rateLimit: Long,
    val owner: String? = null
)
