import { TpService } from '@tarpit/core'
import { HttpContext, HttpHooks, TpRequest, TpWebSocket } from '@tarpit/http'
import { LoggerService } from '../../common/services/logger.service'

@TpService({ inject_root: true })
export class ApiHttpHooks extends HttpHooks {

    constructor(
        private logger: LoggerService
    ) {
        super()
    }

    async on_init(context: HttpContext): Promise<void> {
        context.set('process_start', Date.now())
    }

    async on_finish(context: HttpContext): Promise<void> {
        await this.logger.write_request_log(context)
    }

    async on_error(context: HttpContext): Promise<void> {
        await this.logger.write_request_log(context)
    }

    async on_ws_init(socket: TpWebSocket, req: TpRequest): Promise<void> {
        await this.logger.write_log(req.ip, 'OPEN', 'SOCKET', '-', req.path ?? '-')
    }

    async on_ws_close(socket: TpWebSocket, req: TpRequest, code: number): Promise<void> {
        await this.logger.write_log(req.ip, 'CLOSE', 'SOCKET', code + '', req.path ?? '-')
    }
}
