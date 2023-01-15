import { TpRoot } from '@tarpit/core'
import { HttpAuthenticator, HttpHooks } from '@tarpit/http'
import { MyAuthenticator } from './authenticator'
import { AccountMongo } from './data/account.mongo'
import { InvitationMongo } from './data/invitation.mongo'
import { MyHttpHooks } from './hooks'
import { AccountRouter } from './routers/account.router'
import { EjsRouter } from './routers/ejs.router'
import { HealthCheckRouter } from './routers/health-check.router'
import { AccountService } from './services/account.service'
import { TokenService } from './services/token.service'

@TpRoot({
    providers: [
        AccountMongo,
        InvitationMongo,
        AccountService,
        TokenService,
        { provide: HttpHooks, useClass: MyHttpHooks },
        { provide: HttpAuthenticator, useClass: MyAuthenticator },
    ],
    entries: [
        AccountRouter,
        EjsRouter,
        HealthCheckRouter,
    ],
})
export class PlankRoot {
}
