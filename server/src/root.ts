import { TpRoot } from '@tarpit/core'
import { HttpAuthenticator, HttpHooks } from '@tarpit/http'
import { MyAuthenticator } from './authenticator'
import { AccountMongo } from './data/account.mongo'
import { InvitationMongo } from './data/invitation.mongo'
import { MyHttpHooks } from './hooks'
import { ApiRouterModule } from './apis/api-router.module'
import { PageRouterModule } from './pages/page-router.module'
import { AccountService } from './services/account.service'
import { DockerContainerService } from './services/docker-container.service'
import { TokenService } from './services/token.service'

@TpRoot({
    providers: [
        AccountMongo,
        AccountService,
        InvitationMongo,
        TokenService,
        DockerContainerService,
        { provide: HttpHooks, useClass: MyHttpHooks },
        { provide: HttpAuthenticator, useClass: MyAuthenticator },
    ],
    entries: [
        ApiRouterModule,
        PageRouterModule,
    ],
})
export class PlankRoot {
}
