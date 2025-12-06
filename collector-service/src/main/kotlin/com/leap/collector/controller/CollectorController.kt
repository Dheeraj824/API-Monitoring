package com.leap.collector.controller

import com.leap.collector.service.CollectorService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/logs")
class CollectorController(
    private val collectorService: CollectorService
) {

    @PostMapping
    fun ingestLog(@RequestBody logData: Map<String, Any>) {
        collectorService.processLog(logData)
    }
}
