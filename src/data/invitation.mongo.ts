import { GenericCollection, TpMongo } from '@tarpit/mongodb'
import { ObjectId } from 'mongodb'

export interface InvitationData {
    code: string
    user: ObjectId | null
    created_at: number
}

@TpMongo('main', 'invitation')
export class InvitationMongo extends GenericCollection<InvitationData>() {

}
