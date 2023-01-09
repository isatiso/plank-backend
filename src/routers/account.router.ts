import { Params, Post, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { AccountMongo } from '../data/account.mongo'

@TpRouter('/account', {})
class AccountRouter {

    constructor(
        private account_mongo: AccountMongo,
    ) {
    }

    @Post()
    async register(params: Params<{
        username: string,
        password: string,
    }>) {
        const username = params.ensure('username', Jtl.string)
        const password = params.ensure('password', Jtl.string)

        const hashed_password = crypto.createHash('md5').update(password).digest('base64')
        const now = Date.now()

        const res = await this.account_mongo.insertOne({ _id: new ObjectId(), username, password: hashed_password, created_at: now, updated_at: now })

        return { id: res.insertedId }
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
