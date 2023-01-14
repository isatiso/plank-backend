import { Auth, Get, Guard, JsonBody, Params, Post, throw_forbidden, throw_not_found, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import crypto from 'crypto'
import { AccountMongo } from '../data/account.mongo'
import { InvitationMongo } from '../data/invitation.mongo'
import { TokenService } from '../services/token.service'

@TpRouter('/account', {})
export class AccountRouter {

    constructor(
        private account: AccountMongo,
        private invitation: InvitationMongo,
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

        const invitation = await this.invitation.findOne({ code: invitation_code, user: { $eq: null } })
        if (!invitation) {
            throw_forbidden('Invitation code is not available.')
        }

        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)

        const salt = crypto.randomUUID()
        const hashed_password = crypto.createHash('sha1').update(salt + password + salt).digest('hex')
        const now = Date.now()
        const res = await this.account.insertOne({ username, salt, password: hashed_password, created_at: now, updated_at: now })
        await this.invitation.updateOne({ code: invitation_code }, { $set: { user: res.insertedId } })
        return { id: res.insertedId }
    }

    @Post()
    async signin(body: JsonBody<{
        username: string,
        password: string,
    }>) {
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)

        const user_info = await this.account.findOne({ username })
        if (!user_info) {
            throw_not_found()
        }

        const salt = user_info.salt
        const hashed_password = crypto.createHash('sha1').update(salt + password + salt).digest('hex')
        if (hashed_password !== user_info.password) {
            throw_not_found()
        }

        return { token: this.token_service.generate({ username: username }) }
    }

    @Get()
    async ping() {
        return 'pong'
    }

    @Auth()
    @Post()
    async info(guard: Guard) {
        const username = guard.ensure('username', Jtl.string)
        return this.account.findOne({ username })
    }

}
