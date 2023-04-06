import { TpRoot } from '@tarpit/core'
import { HttpHooks } from '@tarpit/http'
import { PageHttpHooks } from './hooks'
import { MainPageRouter } from './routers/main-page.router'
import { MarkdownRouter } from './routers/markdown.router'
import { StaticRouter } from './routers/static.router'
import { EjsTemplateService } from './services/ejs-template.service'
import { MarkdownDocumentService } from './services/markdown-document.service'

@TpRoot({
    providers: [
        EjsTemplateService,
        MarkdownDocumentService,
        { provide: HttpHooks, useClass: PageHttpHooks },
    ],
    entries: [
        MainPageRouter,
        MarkdownRouter,
        StaticRouter,
    ]
})
export class PageRouterModule {
}
