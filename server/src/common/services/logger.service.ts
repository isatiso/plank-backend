import { TpService } from '@tarpit/core'
import { Dora } from '@tarpit/dora'
import { HttpContext } from '@tarpit/http'
import process from 'process'
import { AccessLogMongo } from '../mongo'

function calc(data: number) {
    return (data / 1024 / 1024).toFixed(3).padStart(9)
}

function memUsage() {
    const memUsage = process.memoryUsage()
    return `${calc(memUsage.external)} ${calc(memUsage.rss)} ${calc(memUsage.heapTotal)} ${calc(memUsage.heapUsed)} ${(memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2)}%`
}

function assemble_duration(context: HttpContext) {
    const start = context.get('process_start')
    const duration = start ? Date.now() - start : -1
    context.response.set('X-Duration', duration)
    return duration
}

@TpService()
export class LoggerService {

    constructor(
        private access_log: AccessLogMongo
    ) {
    }

    async write_request_log(context: HttpContext) {
        const duration = assemble_duration(context)
        const err_msg = context.response.status >= 400 ? `<${context.result.code} ${context.result.msg}>` : ''
        await this.write_log(context.request.ip, `${duration}ms`, context.request.method ?? '-', context.response.status + '', context.request.path ?? '-', err_msg)
        if (context.response.status === 500) {
            console.log(context.result.origin)
        }
    }

    async write_log(ip: string, duration: string, method: string, status: string, path: string, err_msg: string = '') {
        path = decodeURIComponent(path)
        const now = Dora.now()
        const time_str = now.format('YYYY-MM-DDTHH:mm:ssZZ')
        console.log(`${memUsage()} [${time_str}]${ip.padEnd(18)} ${duration.padStart(8)} ${method.padEnd(7)} ${status.padEnd(6)}`, path, err_msg)
        await this.access_log.insertOne({ ip, duration, method, status, path, err_msg, created_at: now.valueOf() })
    }
}
