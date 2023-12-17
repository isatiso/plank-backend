import { TpService } from '@tarpit/core'
import { throw_forbidden } from '@tarpit/http'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { AccountData } from 'plank-types'
import { AccountMongo, InvitationMongo } from '../mongo'

@TpService()
export class AccountService {

    constructor(
        private account: AccountMongo,
        private invitation: InvitationMongo,
    ) {
    }

    async create(username: string, password: string, invitation_code: string): Promise<{ id: ObjectId }> {
        const invitation = await this.invitation.findOne({ code: invitation_code, user: { $eq: null } })
        if (!invitation) {
            throw_forbidden('Invitation code is not available.')
        }
        const salt = crypto.randomUUID()
        const hashed_password = crypto.createHash('sha1').update(salt + password + salt).digest('hex')
        const now = Date.now()
        const res = await this.account.insertOne({ username, salt, password: hashed_password, created_at: now, updated_at: now })
        await this.invitation.updateOne({ code: invitation_code }, { $set: { user: res.insertedId } })
        return { id: res.insertedId }
    }

    async check(username: string, password: string): Promise<AccountData | undefined> {
        const user_info = await this.account.findOne({ username })
        if (!user_info) {
            return
        }

        const salt = user_info.salt
        const hashed_password = crypto.createHash('sha1').update(salt + password + salt).digest('hex')
        if (hashed_password !== user_info.password) {
            return
        }
        return user_info
    }

    async get(username: string) {
        return this.account.findOne({ username })
    }
}
