import { TpService } from '@tarpit/core'
import { Dora } from '@tarpit/dora'
import { HttpContext, HttpHooks } from '@tarpit/http'

function calc(data: number) {
    return (data / 1024 / 1024).toFixed(3).padStart(9)
}

function memUsage() {
    const memUsage = process.memoryUsage()
    return `${calc(memUsage.external)} ${calc(memUsage.rss)} ${calc(memUsage.heapTotal)} ${calc(memUsage.heapUsed)} ${(memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2)}%`
}

export function assemble_duration(context: HttpContext) {
    const start = context.get('process_start')
    const duration = start ? Date.now() - start : -1
    context.response.set('X-Duration', duration)
    return duration
}

export function create_log(context: HttpContext, duration: number) {
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

@TpService({ inject_root: true })
export class MyHttpHooks extends HttpHooks {

    async on_init(context: HttpContext): Promise<void> {
        context.set('process_start', Date.now())
    }

    async on_finish(context: HttpContext): Promise<void> {
        const duration = assemble_duration(context)
        create_log(context, duration)
    }

    async on_error(context: HttpContext): Promise<void> {
        const duration = assemble_duration(context)
        create_log(context, duration)
    }
}
