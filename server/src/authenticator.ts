import { TpService } from '@tarpit/core'
import { Guard, HttpAuthenticator, HttpCredentials, throw_unauthorized, TpRequest } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { TokenService } from './services/token.service'

@TpService({ inject_root: true })
export class MyAuthenticator extends HttpAuthenticator {

    constructor(
        private token_service: TokenService,
    ) {
        super()
    }

    async get_credentials(request: TpRequest): Promise<HttpCredentials | undefined> {
        const [type, credentials] = request.get('Authorization')?.split(' ') ?? []
        if (type !== 'Tarpit') {
            return
        }
        const info = this.token_service.parse<{ username: string }>(credentials)
        if (info) {
            return { type, credentials, username: info.username }
        }
    }

    async authenticate(guard: Guard): Promise<void> {
        guard.ensure('username', Jtl.exist, () => {
            throw_unauthorized({ msg: 'credentials not exists', headers: { 'WWW-Authenticate': 'Basic' } })
        })
    }
}
