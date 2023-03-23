import { TpModule } from '@tarpit/core'
import { AccountMongo } from './account.mongo'
import { InvitationMongo } from './invitation.mongo'

@TpModule({
    providers: [
        InvitationMongo,
        AccountMongo,
    ]
})
export class PlankDataModule {

}
