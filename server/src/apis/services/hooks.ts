import { TpService } from '@tarpit/core'
import { HttpContext, HttpHooks } from '@tarpit/http'
import { create_log } from '../../tools/logger'

@TpService({ inject_root: true })
export class ApiHttpHooks extends HttpHooks {

    constructor() {
        super()
    }

    async on_init(context: HttpContext): Promise<void> {
        context.set('process_start', Date.now())
    }

    async on_finish(context: HttpContext): Promise<void> {
        create_log(context)
    }

    async on_error(context: HttpContext): Promise<void> {
        create_log(context)
    }
}
