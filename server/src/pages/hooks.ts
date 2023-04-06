import { TpService } from '@tarpit/core'
import { HttpContext, HttpHooks } from '@tarpit/http'
import { create_log } from '../tools/logger'
import { EjsTemplateService } from './services/ejs-template.service'

@TpService({ inject_root: true })
export class PageHttpHooks extends HttpHooks {

    constructor(
        private template: EjsTemplateService,
    ) {
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
        context.response.content_type = 'text/html'
        context.response.body = this.template.render('page_error', {
            title: context.response.message,
            page_title: context.response.message,
            page_description: context.result.origin?.message ?? context.response.message,
        })
    }
}
