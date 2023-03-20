import { TpRoot } from '@tarpit/core'
import { EjsRouter } from './routers/ejs.router'
import { MarkdownRouter } from './routers/markdown.router'
import { StaticRouter } from './routers/static.router'
import { EjsTemplateService } from './services/ejs-template.service'

@TpRoot({
    providers: [
        EjsTemplateService
    ],
    entries: [
        EjsRouter,
        MarkdownRouter,
        StaticRouter,
    ]
})
export class PageRouterModule {
}
