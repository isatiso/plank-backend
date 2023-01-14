import { TpRoot } from '@tarpit/core'
import { HttpAuthenticator, HttpHooks } from '@tarpit/http'
import { MyAuthenticator } from './authenticator'
import { AccountMongo } from './data/account.mongo'
import { InvitationMongo } from './data/invitation.mongo'
import { MyHttpHooks } from './hooks'
import { AccountRouter } from './routers/account.router'
import { EjsRouter } from './routers/ejs.router'
import { TokenService } from './services/token.service'

@TpRoot({
    providers: [
        AccountMongo,
        InvitationMongo,
        TokenService,
        { provide: HttpHooks, useClass: MyHttpHooks },
        { provide: HttpAuthenticator, useClass: MyAuthenticator },
    ],
    entries: [
        AccountRouter,
        EjsRouter,
    ],
})
export class PlankRoot {
}
