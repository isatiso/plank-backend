import { Get, TpRouter } from '@tarpit/http'

@TpRouter('/health', {})
export class HealthCheckRouter {
    @Get()
    async ping() {
        return 'pong'
    }
}
