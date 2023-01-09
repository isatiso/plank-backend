import { GenericCollection, TpMongo } from '@tarpit/mongodb'
import { ObjectId } from 'mongodb'

export interface AccountData {
    _id: ObjectId
    username: string
    password: string
    created_at: number
    updated_at: number
}

@TpMongo('main', 'account')
export class AccountMongo extends GenericCollection<AccountData>() {

}
