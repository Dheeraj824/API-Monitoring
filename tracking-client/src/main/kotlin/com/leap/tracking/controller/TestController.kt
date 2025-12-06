package com.leap.tracking.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.Random

@RestController
@RequestMapping("/test")
class TestController {

    private val random = Random()

    @GetMapping("/success")
    fun success(): String {
        return "Operation successful"
    }

    @GetMapping("/error")
    fun error(): String {
        throw RuntimeException("Simulated internal server error")
    }

    @GetMapping("/slow")
    fun slow(): String {
        Thread.sleep(600) // Sleep for 600ms to trigger >500ms latency alert
        return "Slow operation completed"
    }

    @GetMapping("/random")
    fun random(): String {
        val action = random.nextInt(10)
        return when {
            action < 7 -> "Success" // 70% success
            action < 9 -> {
                Thread.sleep(600)
                "Slow Success" // 20% slow
            }
            else -> throw RuntimeException("Random Error") // 10% error
        }
    }
}
