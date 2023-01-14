import { GenericCollection, TpMongo } from '@tarpit/mongodb'

export interface AccountData {
    username: string
    password: string
    salt: string
    created_at: number
    updated_at: number
}

@TpMongo('main', 'account')
export class AccountMongo extends GenericCollection<AccountData>() {

}
