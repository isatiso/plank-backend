import { Auth, Guard, JsonBody, Post, throw_not_found, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { AccountResponse, RestResponse } from 'plank-types'
import { AccountService } from '../../common/services/account.service'
import { TokenService } from '../../common/services/token.service'

@TpRouter('/account')
export class AccountRouter implements RestResponse<AccountResponse> {

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
        const res = await this.account.create(username, password, invitation_code)
        return { id: res.id.toString() }
    }

    @Post()
    async signin(body: JsonBody<{
        username: string
        password: string
    }>) {
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)
        if (username === process.env['PLANK_SITE_USERNAME'] && password === process.env['PLANK_SITE_PASSWORD']) {
            return { token: this.token_service.generate({ username: username, type: 'administrator' }) }
        }
        const user_info = this.account.check(username, password)
        if (!user_info) {
            throw_not_found()
        }
        return { token: this.token_service.generate({ username: username, type: 'normal' }) }
    }

    @Auth()
    @Post()
    async info(guard: Guard) {
        const username = guard.ensure('username', Jtl.string)
        const info = await this.account.get(username)
        return { info: info ? { ...info, _id: info._id.toString() } : null }
    }
}
