import { TpRoot } from '@tarpit/core'
import { HttpBodyFormatter, HttpHooks } from '@tarpit/http'
import { BodyFormatter } from './services/body-formatter'
import { AccountRouter } from './routers/account.router'
import { BaseRouter } from './routers/base.router'
import { ComicRouter } from './routers/comic.router'
import { DockerContainerRouter } from './routers/docker-container.router'
import { MarkdownDataRouter } from './routers/markdown-data.router'
import { ApiHttpHooks } from './services/hooks'

@TpRoot({
    providers: [
        { provide: HttpBodyFormatter, useClass: BodyFormatter },
        { provide: HttpHooks, useClass: ApiHttpHooks },
    ],
    entries: [
        AccountRouter,
        BaseRouter,
        DockerContainerRouter,
        MarkdownDataRouter,
        ComicRouter,
    ]
})
export class ApiRouterModule {
}
