import { Get, TpRouter } from '@tarpit/http'
import axios from 'axios'

@TpRouter('/health', {})
export class HealthCheckRouter {
    @Get()
    async ping() {
        return 'pong'
    }

    @Get()
    async test() {
        const res = await axios.get('http://localhost/containers/json', { socketPath: '/var/run/docker.sock' })
        return res.data
    }
}
