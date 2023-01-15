import { Auth, Get, Guard, JsonBody, Post, throw_not_found, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { AccountService } from '../services/account.service'
import { TokenService } from '../services/token.service'

@TpRouter('/account', {})
export class AccountRouter {

    constructor(
        private account: AccountService,
        private token_service: TokenService,
    ) {
    }

    @Post()
    async register(body: JsonBody<{
        username: string
        password: string
        invitation: string
    }>) {
        const invitation_code = body.ensure('invitation', Jtl.non_empty_string)
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)
        return this.account.create(username, password, invitation_code)
    }

    @Post()
    async signin(body: JsonBody<{
        username: string,
        password: string,
    }>) {
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)
        const user_info = this.account.check(username, password)
        if (!user_info) {
            throw_not_found()
        }
        return { token: this.token_service.generate({ username: username }) }
    }

    @Auth()
    @Post()
    async info(guard: Guard) {
        const username = guard.ensure('username', Jtl.string)
        return this.account.get(username)
    }
}
