import { Dora } from '@tarpit/dora'
import { HttpContext } from '@tarpit/http'
import process from 'process'

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

export function create_log(context: HttpContext) {
    const duration = assemble_duration(context)
    const time_str = Dora.now().format('YYYY-MM-DDTHH:mm:ssZZ')
    const ip = context.request.ip.padEnd(18)
    const duration_str = `${duration}ms`.padStart(8)
    const method_str = (context.request.method ?? '-').padEnd(7)
    const status = context.response.status
    const err_msg = status >= 400 ? `<${context.result.code} ${context.result.msg}>` : ''
    console.log(`${memUsage()} [${time_str}]${ip} ${duration_str} ${method_str} ${status}`, context.request.path, err_msg)
    if (status === 500) {
        console.log(context.result.origin)
    }
}
