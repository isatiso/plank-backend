import { Get, JsonBody, Params, Post, TpResponse, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import crypto from 'crypto'
import ejs from 'ejs'
import { AccountMongo } from '../data/account.mongo'

@TpRouter('/account', {})
export class AccountRouter {

    constructor(
        private account_mongo: AccountMongo,
    ) {
    }

    @Post()
    async register(params: JsonBody<{
        username: string,
        password: string,
    }>) {
        const username = params.ensure('username', Jtl.string)
        const password = params.ensure('password', Jtl.string)

        const hashed_password = crypto.createHash('md5').update(password).digest('hex')
        const now = Date.now()
        const res = await this.account_mongo.insertOne({ username, password: hashed_password, created_at: now, updated_at: now })
        return { id: res.insertedId }
    }

    @Get()
    async ping() {
        return 'pong'
    }



    @Post()
    async info(params: JsonBody<{
        username: string,
    }>) {
        const username = params.ensure('username', Jtl.string)
        return this.account_mongo.findOne({ username })
    }

    @Post()
    async signin(params: Params<{
        username: string,
        password: string,
    }>) {
        const username = params.ensure('username', Jtl.string)
        const password = params.ensure('password', Jtl.string)

    }
}
