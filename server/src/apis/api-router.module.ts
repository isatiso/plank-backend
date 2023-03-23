import { TpRoot } from '@tarpit/core'
import { HttpHooks } from '@tarpit/http'
import { AccountRouter } from './routers/account.router'
import { BaseRouter } from './routers/base.router'
import { DockerContainerRouter } from './routers/docker-container.router'
import { HealthCheckRouter } from './routers/health-check.router'
import { ApiHttpHooks } from './services/hooks'

@TpRoot({
    providers: [
        { provide: HttpHooks, useClass: ApiHttpHooks },
    ],
    entries: [
        AccountRouter,
        BaseRouter,
        DockerContainerRouter,
        HealthCheckRouter,
    ]
})
export class ApiRouterModule {
}
