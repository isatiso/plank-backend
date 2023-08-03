import { TpRoot } from '@tarpit/core'
import { HttpHooks } from '@tarpit/http'
import { ScheduleHooks } from '@tarpit/schedule'
import { CustomScheduleHook } from '../common/services/hooks/custom-schedule.hook'
import { MarkdownDocumentService } from '../common/services/markdown-document.service'
import { PageHttpHooks } from './hooks'
import { ComicRouter } from './routers/comic.router'
import { MainPageRouter } from './routers/main-page.router'
import { MarkdownRouter } from './routers/markdown.router'
import { StaticRouter } from './routers/static.router'
import { RefreshMarkdownSchedule } from './schedules/refresh-markdown.schedule'
import { EjsTemplateService } from './services/ejs-template.service'

@TpRoot({
    providers: [
        EjsTemplateService,
        MarkdownDocumentService,
        { provide: ScheduleHooks, useClass: CustomScheduleHook },
        { provide: HttpHooks, useClass: PageHttpHooks },
    ],
    entries: [
        MainPageRouter,
        ComicRouter,
        MarkdownRouter,
        StaticRouter,
        RefreshMarkdownSchedule,
    ]
})
export class PageRouterModule {
}
