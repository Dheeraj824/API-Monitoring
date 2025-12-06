package com.leap.collector.repository.metadata

import com.leap.collector.model.ServiceMetadata
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ServiceMetadataRepository : MongoRepository<ServiceMetadata, String>
