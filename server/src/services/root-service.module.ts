import { TpRoot } from '@tarpit/core'
import { HttpAuthenticator } from '@tarpit/http'
import { InvitationMongo } from '../data/invitation.mongo'
import { MyAuthenticator } from './authenticator'
import { AccountService } from './account.service'
import { DockerContainerService } from './docker-container.service'
import { TokenService } from './token.service'

@TpRoot({
    providers: [
        AccountService,
        DockerContainerService,
        TokenService,
        { provide: HttpAuthenticator, useClass: MyAuthenticator },
    ]
})
export class RootServiceModule {
}
