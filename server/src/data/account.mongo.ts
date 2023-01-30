import { GenericCollection, TpMongo } from '@tarpit/mongodb'

export interface AccountData {
    username: string
    password: string
    salt: string
    created_at: number
    updated_at: number
}

@TpMongo('main', 'account', { client_name: 'mongo1' })
export class AccountMongo extends GenericCollection<AccountData>() {
}
