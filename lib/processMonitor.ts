export class ProcessMonitor {
  private static instance: ProcessMonitor
  private startTime: number
  private memoryThreshold: number = 500 * 1024 * 1024 // 500MB
  private monitoringInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startTime = Date.now()
    this.setupProcessHandlers()
    this.logStartup()
  }

  public static getInstance(): ProcessMonitor {
    if (!ProcessMonitor.instance) {
      ProcessMonitor.instance = new ProcessMonitor()
    }
    return ProcessMonitor.instance
  }

  private setupProcessHandlers(): void {
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📋 [ProcessMonitor] Received SIGTERM, shutting down gracefully...')
      this.logShutdown('SIGTERM')
      this.cleanup()
      process.exit(0)
    })

    process.on('SIGINT', () => {
      console.log('📋 [ProcessMonitor] Received SIGINT, shutting down gracefully...')
      this.logShutdown('SIGINT')
      this.cleanup()
      process.exit(0)
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('🚨 [ProcessMonitor] Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        uptime: this.getUptime(),
        memory: process.memoryUsage()
      })
      this.cleanup()
      process.exit(1)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 [ProcessMonitor] Unhandled Rejection:', {
        reason,
        promise,
        timestamp: new Date().toISOString(),
        uptime: this.getUptime(),
        memory: process.memoryUsage()
      })
      this.cleanup()
      process.exit(1)
    })

    // Handle warnings
    process.on('warning', (warning) => {
      console.warn('⚠️ [ProcessMonitor] Process Warning:', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
        timestamp: new Date().toISOString()
      })
    })
  }

  private logStartup(): void {
    const memoryUsage = process.memoryUsage()
    console.log('🚀 [ProcessMonitor] Application started:', {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      },
      environment: process.env.NODE_ENV || 'development'
    })
  }

  private logShutdown(signal: string): void {
    const memoryUsage = process.memoryUsage()
    console.log(`🛑 [ProcessMonitor] Application shutting down (${signal}):`, {
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      signal,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      }
    })
  }

  public startMemoryMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(() => {
      const usage = process.memoryUsage()
      const heapUsedMB = usage.heapUsed / 1024 / 1024
      const rssMB = usage.rss / 1024 / 1024

      // Log memory usage periodically
      if (heapUsedMB > this.memoryThreshold / 1024 / 1024) {
        console.warn('⚠️ [ProcessMonitor] High memory usage detected:', {
          timestamp: new Date().toISOString(),
          uptime: this.getUptime(),
          memory: {
            heapUsed: `${Math.round(heapUsedMB)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(usage.external / 1024 / 1024)}MB`,
            rss: `${Math.round(rssMB)}MB`
          },
          threshold: `${Math.round(this.memoryThreshold / 1024 / 1024)}MB`
        })

        // Force garbage collection if available
        if (global.gc) {
          console.log('🧹 [ProcessMonitor] Running garbage collection...')
          global.gc()
        }
      }
    }, intervalMs)
  }

  public logMemoryUsage(context: string = 'Manual'): void {
    const usage = process.memoryUsage()
    console.log(`📊 [ProcessMonitor] Memory usage (${context}):`, {
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      memory: {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
      }
    })
  }

  public setMemoryThreshold(thresholdMB: number): void {
    this.memoryThreshold = thresholdMB * 1024 * 1024
    console.log(`📋 [ProcessMonitor] Memory threshold set to ${thresholdMB}MB`)
  }

  private getUptime(): string {
    const uptimeMs = Date.now() - this.startTime
    const uptimeSeconds = Math.floor(uptimeMs / 1000)
    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = uptimeSeconds % 60
    return `${hours}h ${minutes}m ${seconds}s`
  }

  private cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  public getHealthStatus() {
    const usage = process.memoryUsage()
    const uptime = this.getUptime()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024)
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    }
  }
}

// Initialize the monitor
export const processMonitor = ProcessMonitor.getInstance()