import { Get, TpRouter } from '@tarpit/http'

@TpRouter('/', {})
export class BaseRouter {

    @Get('plank-environment')
    async environment() {
        return {
            api_host: process.env.PLANK_SERVER_HOST ?? ''
        }
    }
}
