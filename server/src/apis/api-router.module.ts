import { TpRoot } from '@tarpit/core'
import { AccountRouter } from './routers/account.router'
import { BaseRouter } from './routers/base.router'
import { DockerContainerRouter } from './routers/docker-container.router'
import { HealthCheckRouter } from './routers/health-check.router'

@TpRoot({
    entries: [
        AccountRouter,
        BaseRouter,
        DockerContainerRouter,
        HealthCheckRouter,
    ]
})
export class ApiRouterModule {
}
